# Cloudflare Worker Setup for URL Shortener

This guide helps you set up a Cloudflare Worker to bypass SSL client certificate issues.

## Why Use Cloudflare Worker?

Some URL shortening services (like Ulvis.net) may require SSL client certificates that Obsidian cannot provide. A Cloudflare Worker acts as a proxy, making the request from Cloudflare's servers instead of directly from your browser.

## Setup Steps

### 1. Create a Cloudflare Account
- Go to [cloudflare.com](https://cloudflare.com) and sign up for a free account
- No credit card required for the free tier

### 2. Create a Worker

1. Log into your Cloudflare dashboard
2. Click on "Workers & Pages" in the sidebar
3. Click "Create Application"
4. Choose "Create Worker"
5. Give it a name like `url-shortener-proxy`
6. Click "Deploy"

### 3. Edit the Worker Code

1. Click "Edit code"
2. Replace the default code with the contents of `cloudflare-worker.js`
3. Click "Save and Deploy"

### 4. Get Your Worker URL

Your worker URL will be something like:
```
https://url-shortener-proxy.YOUR-SUBDOMAIN.workers.dev
```

### 5. Configure the Plugin

Add your worker URL to the plugin settings (see plugin configuration).

## Testing the Worker

You can test your worker by visiting:
```
https://YOUR-WORKER-URL/?url=https://example.com
```

It should return a JSON response with the shortened URL.

## Free Tier Limits

Cloudflare Workers free tier includes:
- 100,000 requests per day
- 10ms CPU time per invocation
- Unlimited workers

This is more than enough for personal URL shortening use.

## Security Notes

- The worker code includes CORS headers to allow requests from Obsidian
- No authentication is required for the free setup
- For production use, consider adding rate limiting or authentication