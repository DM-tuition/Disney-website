# 🖼️ Drop your hero pictures here

Put your character / product photos in this folder, then point a product at it
by adding an `img` field in `script.js` (in the `PRODUCTS` list).

## How to wire a picture in

1. Save the image here, e.g. `images/woody.png` (PNG with transparent background looks best).
2. In `script.js`, find the product and add an `img` line:

```js
{ id: "woody", name: "Woody Interactive Talking Figure", cat: "toys",
  emoji: "🤠", img: "images/woody.png", price: 40, ... }
```

That's it. If the image is missing or fails to load, the card automatically
falls back to the emoji — so the demo never breaks on the day.

## Suggested filenames (match the screenshots you sent)

| Product id      | Suggested file            |
|-----------------|---------------------------|
| `woody`         | `images/woody.png`        |
| `buzz`          | `images/buzz.png`         |
| `jessie`        | `images/jessie.png`       |
| (store photo)   | `images/store-hero.jpg`   |

Transparent PNGs of the characters work best on the cards.
Wide landscape photos (like the store interior) are great for backgrounds.
