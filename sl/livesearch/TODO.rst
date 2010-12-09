High Priority
=============

- (Paul/Robert) Sticky policies on context menus.
  (look into jstore. can store hierarchically under personal info)

- (Paul/Robert) Handle multi-word searchterms.  Pain.

- (Paul) Wire up activation, meaning, navigate to other pages.  Enter,
  click, click on button, or click on "more".  Make sure to pack into
  the search which contextmenu item was chosen.

Medium Priority
===============

- (Robert) Menu requires tabbing into it to get cursor movement to work.

- (Robert) When the resultsbox is visible, clicking in the contextmenu
  should make the resultsbox vanish and the contextmenu appear.

- (Paul) When keypresses don't yield enough characters to trigger a
  search, display a small box telling them they need to type in some
  more characters.  This has to also work in a multiword scenerio,
  when the cursor is positioned in a word without enough characters.

- (Paul) Some notice message saying results are being retrieved.
  Similar to "When keypresses..." above.  Provide an error message if
  the server is down or the payload broken.

- (Robert) When mouse is hovering a menu item, cursor keys can move the
  highlighted item, but the item under the mouse remains selected too.

Low Priority
============

- (Chrissy) See if we can get a em based approach to sizes (box,
  fonts) instead of px across browsers.

- (Robert) Have a consistent, namespaced approach to selector names.

- (Robert) Handle tabbing correctly (which also means, define
  "correct")

- (Robert) We have a bug where new searches seem to remember the old
  selection value.

- (Robert) Make sure international characters get handled correctly
  (passed to the server correctly.)

- (Paul) If text is too long, either chop it off with overflow: hidden
  or use jQuery to try and chop it off with ellipsis.  In either case,
  have the hover show the full value.

- (Robert) Menu requires tabbing into it to get cursor movement to work. Should
  be able to go up and down through results. With results, maybe have tab/shift
  tab go through the results like up/down does.

- (Robert) When the resultsbox is visible, clicking in the contextmenu should
  make the resultsbox vanish and the contextmenu appear. Doesn't work in
  firefox4, but in 3.

- (Robert) Try to keep the resultsbox in the viewport on "normal"
  browser dimensions.

Completed
=========

- (Paul) Make file URLs work by setting parseType to JSON

- (Robert) Support showing "People" in results box

- (Chrissy) Get the spacing right between the subwidgets, so there
  isn't any background leaking through.

Wont Fix
========
- (Chrissy) Some concept of striping for even/odd rows, or some other
  way to avoid them all looking the same.

- (Paul) A ghosted "search..." in the searchbox which disappears when
  onfocus, just as a visual cue that this is for searching.
