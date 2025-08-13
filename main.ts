import { App, Editor, MarkdownView, Notice, Plugin, PluginManifest, PluginSettingTab, Setting, requestUrl } from 'obsidian';

interface Position {
    line: number;
    ch: number;
}

interface URLShortenerSettings {
    cloudflareWorkerUrl: string;
    useCloudflareProxy: boolean;
    preferredService: 'ulvis' | 'tinyurl' | 'cleanuri';
}

const DEFAULT_SETTINGS: URLShortenerSettings = {
    cloudflareWorkerUrl: '',
    useCloudflareProxy: false,
    preferredService: 'ulvis'
}

export default class URLShortenerPlugin extends Plugin {
    settings: URLShortenerSettings;
    
    constructor(app: App, manifest: PluginManifest) {
        super(app, manifest);
    }

    async onload() {
        await this.loadSettings();
        this.addStyles();
        
        this.registerEvent(
            this.app.workspace.on('editor-paste', this.handlePaste.bind(this))
        );
        
        this.addCommand({
            id: 'shorten-url-at-cursor',
            name: 'Shorten URL at cursor',
            editorCallback: (editor: Editor) => {
                const cursor = editor.getCursor();
                const line = editor.getLine(cursor.line);
                const urlMatch = line.match(/(https?:\/\/[^\s]+)/);
                
                if (urlMatch) {
                    const url = urlMatch[0];
                    const startCh = line.indexOf(url);
                    const startPos: Position = { line: cursor.line, ch: startCh };
                    const endPos: Position = { line: cursor.line, ch: startCh + url.length };
                    this.showShortenPopover(editor, url, startPos, endPos);
                } else {
                    new Notice('No URL found at cursor position');
                }
            }
        });
        
        this.addSettingTab(new URLShortenerSettingTab(this.app, this));
    }
    
    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    private addStyles(): void {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideUpSpring {
                0% {
                    transform: translateY(100%);
                    opacity: 0;
                }
                60% {
                    transform: translateY(-10px);
                    opacity: 1;
                }
                80% {
                    transform: translateY(5px);
                }
                100% {
                    transform: translateY(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideDownFade {
                0% {
                    transform: translateY(0);
                    opacity: 1;
                }
                100% {
                    transform: translateY(100%);
                    opacity: 0;
                }
            }
            
            .url-shortener-popover {
                animation: slideUpSpring 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
            }
            
            .url-shortener-popover.closing {
                animation: slideDownFade 0.3s ease-out forwards;
            }
        `;
        document.head.appendChild(style);
    }

    private isValidUrl(string: string): boolean {
        try {
            const url = new URL(string);
            return url.protocol === 'http:' || url.protocol === 'https:';
        } catch (_) {
            return false;
        }
    }

    private async handlePaste(evt: ClipboardEvent, editor: Editor): Promise<void> {
        const clipboardData = evt.clipboardData || (window as any).clipboardData;
        if (!clipboardData) return;
        
        const pastedText = clipboardData.getData('text');
        
        if (!this.isValidUrl(pastedText)) {
            return;
        }

        setTimeout(() => {
            const cursor = editor.getCursor();
            const line = editor.getLine(cursor.line);
            const urlIndex = line.lastIndexOf(pastedText);
            
            if (urlIndex !== -1) {
                const startPos: Position = { line: cursor.line, ch: urlIndex };
                const endPos: Position = { line: cursor.line, ch: urlIndex + pastedText.length };
                this.showShortenPopover(editor, pastedText, startPos, endPos);
            }
        }, 100);
    }

    private showShortenPopover(editor: Editor, url: string, startPos: Position, endPos: Position): void {
        const existingPopover = document.querySelector('.url-shortener-popover');
        if (existingPopover) {
            existingPopover.remove();
        }
        
        const popover = document.createElement('div');
        popover.className = 'url-shortener-popover';
        popover.style.position = 'fixed';
        popover.style.bottom = '20px';
        popover.style.left = '50%';
        popover.style.transform = 'translateX(-50%)';
        popover.style.zIndex = '9999';
        popover.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))';
        (popover.style as any).backdropFilter = 'blur(10px)';
        (popover.style as any).webkitBackdropFilter = 'blur(10px)';
        popover.style.border = '1px solid rgba(255,255,255,0.2)';
        popover.style.borderRadius = '12px';
        popover.style.padding = '12px 16px';
        popover.style.boxShadow = '0 8px 32px rgba(0,0,0,0.2)';
        popover.style.display = 'flex';
        popover.style.alignItems = 'center';
        popover.style.gap = '12px';
        popover.style.maxWidth = '90%';

        const urlPreview = document.createElement('span');
        urlPreview.textContent = url.length > 50 ? url.substring(0, 50) + '...' : url;
        urlPreview.style.color = 'var(--text-muted)';
        urlPreview.style.fontSize = '11px';
        urlPreview.style.maxWidth = '200px';
        urlPreview.style.overflow = 'hidden';
        urlPreview.style.textOverflow = 'ellipsis';
        urlPreview.style.whiteSpace = 'nowrap';

        const shortenBtn = document.createElement('button');
        shortenBtn.textContent = '🔗 Shorten';
        shortenBtn.className = 'mod-cta';
        shortenBtn.style.fontSize = '13px';
        shortenBtn.style.padding = '6px 14px';
        shortenBtn.style.borderRadius = '6px';
        shortenBtn.style.fontWeight = '500';

        const closeBtn = document.createElement('button');
        closeBtn.textContent = '✕';
        closeBtn.style.background = 'transparent';
        closeBtn.style.border = '1px solid var(--background-modifier-border)';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.color = 'var(--text-muted)';
        closeBtn.style.width = '24px';
        closeBtn.style.height = '24px';
        closeBtn.style.padding = '0';
        closeBtn.style.fontSize = '14px';
        closeBtn.style.lineHeight = '1';
        closeBtn.style.marginLeft = '4px';
        closeBtn.style.borderRadius = '4px';
        closeBtn.style.display = 'flex';
        closeBtn.style.alignItems = 'center';
        closeBtn.style.justifyContent = 'center';
        closeBtn.style.flexShrink = '0';

        popover.appendChild(urlPreview);
        popover.appendChild(shortenBtn);
        popover.appendChild(closeBtn);
        document.body.appendChild(popover);

        const removePopover = (animate: boolean = true): void => {
            if (animate) {
                popover.classList.add('closing');
                setTimeout(() => {
                    if (popover.parentNode) {
                        popover.remove();
                    }
                }, 300);
            } else {
                if (popover.parentNode) {
                    popover.remove();
                }
            }
        };

        const autoRemoveTimeout = setTimeout(() => removePopover(true), 8000);

        closeBtn.addEventListener('click', () => {
            clearTimeout(autoRemoveTimeout);
            removePopover(true);
        });

        shortenBtn.addEventListener('click', async () => {
            clearTimeout(autoRemoveTimeout);
            shortenBtn.disabled = true;
            shortenBtn.textContent = '⏳ Shortening...';

            try {
                const shortened = await this.shortenUrl(url);
                
                editor.replaceRange(shortened, startPos, endPos);
                
                new Notice('✅ URL shortened successfully!');
                removePopover(true);
            } catch (error) {
                console.error('Error shortening URL:', error);
                new Notice('❌ ' + (error as Error).message);
                shortenBtn.disabled = false;
                shortenBtn.textContent = '🔗 Shorten';
            }
        });
    }

    private async shortenUrl(longUrl: string): Promise<string> {
        let lastError: Error | null = null;
        
        const services = this.getServiceOrder();
        
        for (const service of services) {
            try {
                let shortened: string;
                let serviceName: string;
                
                switch (service) {
                    case 'ulvis':
                        shortened = await this.shortenWithUlvis(longUrl);
                        serviceName = this.settings.useCloudflareProxy ? 'Ulvis.net (via Cloudflare)' : 'Ulvis.net';
                        break;
                    case 'tinyurl':
                        shortened = await this.shortenWithTinyUrl(longUrl);
                        serviceName = 'TinyURL';
                        break;
                    case 'cleanuri':
                        shortened = await this.shortenWithCleanUri(longUrl);
                        serviceName = 'CleanUri';
                        break;
                    default:
                        continue;
                }
                
                new Notice(`✅ Shortened with ${serviceName}`);
                return shortened;
            } catch (error) {
                console.log(`${service} failed:`, (error as Error).message);
                lastError = error as Error;
            }
        }
        
        throw new Error('All URL shortening services failed. Last error: ' + (lastError?.message || 'Unknown error'));
    }
    
    private getServiceOrder(): Array<'ulvis' | 'tinyurl' | 'cleanuri'> {
        const preferred = this.settings.preferredService;
        const allServices: Array<'ulvis' | 'tinyurl' | 'cleanuri'> = ['ulvis', 'tinyurl', 'cleanuri'];
        
        const otherServices = allServices.filter(s => s !== preferred);
        return [preferred, ...otherServices];
    }
    
    private async shortenWithUlvis(longUrl: string): Promise<string> {
        try {
            let response;
            
            if (this.settings.useCloudflareProxy && this.settings.cloudflareWorkerUrl) {
                const proxyUrl = this.settings.cloudflareWorkerUrl + '?url=' + encodeURIComponent(longUrl);
                response = await requestUrl({
                    url: proxyUrl,
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json'
                    }
                });
            } else {
                response = await requestUrl({
                    url: 'https://ulvis.net/api/write/post',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Accept': 'application/json'
                    },
                    body: 'url=' + encodeURIComponent(longUrl) + '&type=json&private=1'
                });
            }

            if (response.status !== 200) {
                throw new Error('API request failed with status: ' + response.status);
            }

            const data = response.json;
            
            if (data.success && data.data && data.data.url) {
                return data.data.url;
            } else if (data.error) {
                throw new Error(data.error.msg || 'API error occurred');
            } else {
                throw new Error('Invalid response format from API');
            }
        } catch (error) {
            if ((error as Error).message.includes('ERR_SSL_CLIENT_AUTH_CERT_NEEDED')) {
                throw new Error('SSL certificate required - try enabling Cloudflare proxy in settings');
            }
            throw error;
        }
    }
    
    private async shortenWithTinyUrl(longUrl: string): Promise<string> {
        try {
            const apiUrl = 'https://tinyurl.com/api-create.php?url=' + encodeURIComponent(longUrl);
            
            const response = await requestUrl({
                url: apiUrl,
                method: 'GET',
                headers: {
                    'Accept': 'text/plain'
                }
            });

            if (response.status !== 200) {
                throw new Error('TinyURL API request failed with status: ' + response.status);
            }

            const shortUrl = response.text.trim();
            
            if (shortUrl && shortUrl.startsWith('https://tinyurl.com/')) {
                return shortUrl;
            } else {
                throw new Error('Invalid response from TinyURL');
            }
        } catch (error) {
            throw new Error('TinyURL error: ' + (error as Error).message);
        }
    }
    
    private async shortenWithCleanUri(longUrl: string): Promise<string> {
        try {
            const response = await requestUrl({
                url: 'https://cleanuri.com/api/v1/shorten',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json'
                },
                body: 'url=' + encodeURIComponent(longUrl)
            });

            if (response.status !== 200) {
                throw new Error('CleanUri API request failed with status: ' + response.status);
            }

            const data = response.json;
            
            if (data.result_url) {
                return data.result_url;
            } else if (data.error) {
                throw new Error(data.error);
            } else {
                throw new Error('Invalid response from CleanUri');
            }
        } catch (error) {
            throw new Error('CleanUri error: ' + (error as Error).message);
        }
    }

    onunload() {
        console.log('URL Shortener plugin unloaded');
    }
}

class URLShortenerSettingTab extends PluginSettingTab {
    plugin: URLShortenerPlugin;

    constructor(app: App, plugin: URLShortenerPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        containerEl.createEl('h2', { text: 'URL Shortener Settings' });
        
        containerEl.createEl('h3', { text: 'Cloudflare Proxy Settings' });
        
        containerEl.createEl('p', { 
            text: 'Using a Cloudflare Worker proxy can help bypass SSL certificate issues.',
            cls: 'setting-item-description'
        });

        new Setting(containerEl)
            .setName('Use Cloudflare Proxy')
            .setDesc('Enable to route Ulvis.net requests through a Cloudflare Worker')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.useCloudflareProxy)
                .onChange(async (value) => {
                    this.plugin.settings.useCloudflareProxy = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Cloudflare Worker URL')
            .setDesc('Your Cloudflare Worker URL (e.g., https://url-shortener.your-subdomain.workers.dev)')
            .addText(text => text
                .setPlaceholder('https://your-worker.workers.dev')
                .setValue(this.plugin.settings.cloudflareWorkerUrl)
                .onChange(async (value) => {
                    this.plugin.settings.cloudflareWorkerUrl = value;
                    await this.plugin.saveSettings();
                }));

        containerEl.createEl('h3', { text: 'Service Preferences' });

        new Setting(containerEl)
            .setName('Preferred Service')
            .setDesc('Choose which URL shortening service to try first')
            .addDropdown(dropdown => dropdown
                .addOption('ulvis', 'Ulvis.net')
                .addOption('tinyurl', 'TinyURL')
                .addOption('cleanuri', 'CleanUri')
                .setValue(this.plugin.settings.preferredService)
                .onChange(async (value: 'ulvis' | 'tinyurl' | 'cleanuri') => {
                    this.plugin.settings.preferredService = value;
                    await this.plugin.saveSettings();
                }));

        containerEl.createEl('div', { 
            text: 'See CLOUDFLARE_SETUP.md for instructions on setting up a Cloudflare Worker.',
            cls: 'setting-item-description'
        });
    }
}