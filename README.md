# Bharathi Kannan Blogs

Personal blog site built with Jekyll (Mediumish theme-based setup).

## Prerequisites

Install the following first:

1. Ruby (recommended: latest stable 3.4.x)
2. Bundler (`gem install bundler`)

Optional on Windows:

1. Ruby+DevKit (recommended installer from RubyInstaller)

## Setup (One-Time)

From the project root (`blogs`):

```powershell
bundle install
```

## Run Locally

Start the local server:

```powershell
bundle exec jekyll serve --livereload
```

Open:

`http://127.0.0.1:4000/blogs/`

Notes:

1. Keep this command running while editing.
2. You do not need to run `serve` again for every content/style change.
3. Just refresh the browser (or use `--livereload` for auto refresh).

## Build Only (No Server)

```powershell
bundle exec jekyll build
```

Generated static files are written to `_site/`.

## When You Must Restart `jekyll serve`

Restart the server only when:

1. `Gemfile` or gem versions change
2. You run `bundle install` or `bundle update`
3. `_config.yml` changes
4. The server crashes/stops

## Common Commands

Install or update gems:

```powershell
bundle install
bundle update
```

Clean generated output:

```powershell
bundle exec jekyll clean
```

## Troubleshooting

### `undefined method 'tainted?' for Hash` (Liquid error)

This is a Ruby/Liquid compatibility issue. The project pins Liquid to a safe version in `Gemfile`.

If you still hit it:

```powershell
bundle update liquid
bundle exec jekyll build
```

### Port already in use

Run on another port:

```powershell
bundle exec jekyll serve --port 4001 --livereload
```

## Credits

Theme base: Mediumish for Jekyll by Sal (WowThemes), MIT license.