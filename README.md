# docker-step-by-step

**Hands-on docker tutorial.**

Live demo @ [marktiedemann.github.io/docker-step-by-step](https://marktiedemann.github.io/docker-step-by-step).

## Development

- `node reorder`: reorders and sorts the slides numerically, from `0` to `slides.length - 1` (this is especially helpful if you want to add slides in between your existing slides, e.g. if you have the slides `0` and `1`, add a slide `0.5`, run `node reorder`, and your slides will be `0`, `1`, and `2`)
- `node concat`: concatenates all slides and creates a single `slides.json` file that can be loaded client-side

## Identifiers

- `>`: file (_purple_)
- `$`: shell (_orange_)
- `|`: code (_white_)
- `#`: comment (_blue_)
- `+`: add (_green_)
- `-`: rm (_red_)

## Special Characters

- All whitespaces will be replaced with `&nbsp;`.
- If you need an actual whitespace, use `\w` instead.

## License

[WTFPL](http://www.wtfpl.net/) – Do What the F*ck You Want to Public License.

Made with :heart: by [@MarkTiedemann](https://twitter.com/MarkTiedemannDE).