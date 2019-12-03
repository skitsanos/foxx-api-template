# foxx-api-template
ArangoDB Foxx Services Template


### netlify.toml example
```toml
[build]
    base = "."
    publish = "./dist"
    functions = "netlify-functions/"

[[redirects]]
    from = "/*"
    to = "/index.html"
    status = 200

[[redirects]]
    from = "/api/*"
    to = "http://{YOUR_HOSTNAME}:8529/_db/{YOUR_ENDPOINT}/api/:splat"
    status = 200
    force = true
    headers = {X-From = "Netlify"}

[[headers]]
    for = "/*"

    [headers.values]
        x-designed-by = "skitsanos, https://github.com/skitsanos"
```
