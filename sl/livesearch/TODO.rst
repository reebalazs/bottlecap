
- (Chrissy) Try to eliminate the whitespace problem in the HTML, where
  we currently have to get the <button> and <ul> and <input> and
  <button> all jammed up against each other.

- (Chrissy) See if we can get a em based approach to sizes (box,
  fonts) instead of px across browsers.

- (Chrissy) When the first item is activated on IE7, the introduction
  of the border causes some "flashing" as the other results move down
  a little.

- (Chrissy) If the amount of results don't fit in the viewport
  (vertically), then we get a scrollbar in the browser.  When the
  scrollbar appears, it pushes the results box and the LiveSearch
  widget over to the left slightly, giving a jerky feel.

- (Chrissy) Better color scheme than "gray", "lightgray".  Later we'll
  convert to use whatever the installed jQuery UI theme wants.

- (Chrissy) If you have any stock monster avatars or something for
  sample profile photos, that would be nice.

- (Chrissy) Some concept of striping for even/odd rows, or some other
  way to avoid them all looking the same.

- Support showing "People" in results box

- Have a consistent, namespaced approach to selector names.

- Come up with a schem to use relative size (em instead of px)

- Menu requires tabbing into it to get cursor movement to work

Fixed
=====

- Make file URLs work by setting parseType to JSON

