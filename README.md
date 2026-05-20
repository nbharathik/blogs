# B2logs

Personal blog site built with Jekyll, based on the Mediumish theme. The site contains interactive posts on machine learning, AI, and related computer science topics.

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

## License

This repository uses mixed licensing:

1. Original blog posts, explanations, diagrams, and interactive visualization content are available under the [Creative Commons Attribution 4.0 International License](https://creativecommons.org/licenses/by/4.0/) unless a post states otherwise.
2. Site source code, layouts, includes, styles, and scripts are available under the MIT License unless a file states otherwise.
3. The site is based on the [Mediumish Jekyll theme](https://github.com/wowthemesnet/mediumish-theme-jekyll) by WowThemes.net, also MIT licensed.

Copyright (c) Bharathi Kannan Nithyanantham.

See [LICENSE.txt](LICENSE.txt) for details. Individual posts may also declare a different license via a `license:` front-matter key.

## Contributing

Contributions are welcome! The focus of this blog is interactive, accessible AI and machine learning education, so anything that moves toward that goal is worth exploring.

Ways to contribute:

- Ideas: suggest topics, concepts, or visualizations you'd find useful
- Code: improve or extend existing interactive demos, fix bugs, or add new ones
- Content: corrections, clarifications, or additional explanations for existing posts
- Visualizations: new interactive graphics or improvements to existing ones

To contribute:

1. Fork the repository
2. Create a branch for your change
3. Open a pull request with a clear description of what you're adding or fixing

For larger changes or new post ideas, opening an issue first to discuss is appreciated.

## AI Assistance Disclosure

This blog aims to make AI and machine learning concepts easier to learn through simple, accessible, and interactive examples. AI tools, including LLMs, are used to help draft, iterate on, and refine parts of the blog, especially code and interactive visualizations. But, building high-quality interactive content still requires a lot of work. Many ideas and concepts here are original, and all published work is reviewed, edited, and curated before publication. If you have questions, or if you find any issues, please reach out via the contact form on the site or open an issue in the repository. If you would like to contribute as an author, please see the [Contributing](#contributing) section above. All contributions are welcome, and the focus is on creating high-quality, accessible educational content to everyone.