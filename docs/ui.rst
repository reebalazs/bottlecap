======================
Bottlecap UI Structure
======================

The Bottlecap UI design is focused on a particular target audience
with an eye towards customization. This document goes through the
structure and details of the UI.

UI Assumptions
==============

#. All "screens" are expected to conform to this.

#. Since this is an admin UI and not a public facing UI, we can set
   aggressive standards on browsers, use of jQuery/jQuery UI, etc.

#. Different boxes in the UI need to be fillable in different ways.
   Other documents will discuss the architecture for this.
 
Basic Frame
===========

The frame of each screen is separated into the following high-level
parts (prefixed with ``bc`` to connote that the naming is official):

- ``bc-header``

- ``bc-navbar``

- ``bc-content``

- ``bc-sidebar``

- ``bc-footer``

The are discussed below.

bc-header
=========

The top-level header area is a global element which doesn't change
from screen to screen.  The header has 4 subelements: ``bc-logo``,
``bc-sitetitle``, ``bc-userpanel``, and ``bc-sitepanel``.

bc-logo
-------

The Bottlecap logo is a clickable element which takes you to a screen
that is "above" all the sites.  It lets you manage sites as well as
any global actions.

bc-sitetitle
------------

It is expected that a single instance might have multiple top-level
"sites" or projects.  The ``bc-sitetitle`` is a hyperlink which goes
to a screen for site administration.

bc-userpanel
------------

Show the username as a hyperlink, a logout link, and any other links
that are aimed at the user.  Also, treat the panel as a "pullout
panel".  (See below for explanation.)  The pullout panel provides
quick access to a person's recent contents and any other contents
configured for that site.

bc-sitepanel
------------

Global actions and links go in the site panel.  The panel is dominated
by the LiveSearch widget which makes it fast to jump around in a site.
The panel also has links for the help system.

bc-navbar
---------

The navbar is our place to squeeze the maximum amount of value.  We
want a way to navigate a system, potentially a hierarchy, that is
effective but doesn't take a lot of space.

Traditionally navtrees are used for this function.  But these take up
a lot of space and break down when they don't fit (vertically) in the
viewport.

The navbar attempts to square this circle by showing the minimum,
until you need it.  That is, it uses a pullout panel to do most of its
work.

There are three major areas in the navbar:

- ``bc-breadcrumbs``.  These are a series of breadcrumbs, rooted just
  below the site indicated in the ``bc-sitetitle``.  More on this
  below.

- ``bc-subsitelinks``.  A series of static links context-dependent on
  what part of the site you are in.

- ``bc-sitelinks``.  A series of static links global to the site.

bc-breadcrumbs
--------------

The navbar is a series a breadcrumbs.  Each breadcrumb is a pullout
panel.  The breadcrumb title is a hyperlink going to that container.
The pullout panel provides popup listing of content at that level, as
well as actions.

bc-subsitelinks
---------------

Perhaps you in a resource such as a wiki page in a project on a site.
The breadcrumbs might be::

  My Project -> Wiki -> Some Wikipage

In such a scenario, it is most likely that the primary navigation will
not be the site.  On a moment-to-moment basis, you won't spend much
time in the site.  You'll be in the context of the project, and want
to jump around from the wiki to the files tool to the issue tracker.

Those links would go into the subsite links.  That is, a quick
navigation that is global within a project that is part of a site.

Stylistically, they need to be clearly identified with the part of the
site that you are in, not with the top-level context of the site.

bc-sitelinks
------------

Links to facilities that span the site.

Challenge
---------

The primary danger: a deep hierarchy that doesn't fit into the width
available, especially with sites that have subsite and site links on
the right.  In particular, I have doubts that we can get much many
breadcrumbs if there are many site and subsite links.  Perhaps we can
find a different home for them.

Pullout Panels
==============

We want a UI that is fast for admins and power users to move around
in.  Pullout panels support this by eliminating full screen-refreshes
by popping up a dialog with quick links and content for the topic of
the panel.

From a user perspective, these pullout panels have two modes of
interaction:

- Clicking on the hyperlink for the panel (the most natural thing to
  do) has the most natural result: navigating away from a screen to
  the screen for the topic of the panel.

- Clicking inside the panel, but on the hyperlink, activates a pullout
  panel.

The pullout panel is a dialog frame that appears to pull out of the
panel.  The panel can be closed by clicking again in the panel,
clicking the ``(x)`` attached to the panel, or clicking somewhere
outside the panel.

To give a visual cue that a panel is a pullout panel, hovering the
cursor inside the panel makes an inverted triangle appear in the
middle of the bottom border.  

While the contents of the pullout panel can be anything, most should
observe some UI conventions:

- A title for the panel.

- Items in that container in a grid or some kind of listing on the
  left, taking most of the width.

- A series of actions or links in a portlet-style presentation on the
  right (similar to the sidebar.)

The pullout panel's contents are loaded dynamically from the server.
