======================
Bottlecap Introduction
======================

Bottlecap is a generic administrative UI for applications in the
Pylons Project.  It provides a default, attractive, and usable user
experience (UX) for application developers to piggyback during the
creation of their project.

Background
==========

Many web frameworks ship with a default web interface for
administrative and content management tasks.  Zope, for example,
provided its "ZMI" (Zope Management Interface) which allowed users to
manage content and adminstrators to configure a site.  Plone provided
a far more attractive version of this approach as its key selling
point.  Subsequent projects such as Django have also delivered
tremendous value by shipping a default UX.

In each of these 3 cases, the story was a bit richer than this
description.  Not only was the out-of-the-box UX attractive, it was
also *extensible*.  An application developer could build an
application in that framework and not have to make a management UI.
Instead, by supporting some plug points, the management interface was
able to introspect and manage objects created by the developer.

Goals
=====

- Attractive.

- Same spirit as Pyramid ("Small, Documented, Tested, Extensible,
  Fast, Stable, Friendly")

- Unbundled.  Not embedded into directly into any application or
  framework, thus making it replaceable.  Thus, while this might be a
  critical ingredient in some larger story atop Pyramid, it is
  compartmentalized from that larger story (as it is hoped each part
  of that larger story is also.)

- Useful for site administrators and power users.

Packages
========

- *bottlecap*.  This is the WSGI application itself that provides the
   UX.

- *bottlecap.jslibs*.  Separately-distributed package which contains
   the well-curated and well-distributed set of JavaScript libraries
   used in Bottlecap.  People making a custom UX for a project can
   thus grab just the set of static resources needed, if they perceive
   a benefit to piggybacking the work.

- *bottlecap.themes*.  A "lightweight theme" with the UX used by
   Bottlecap.  Perhaps a set of themes if there are multiple choices.

- *bottlecap.widgets*.  A collection of jQuery UI widgets developed as
   part of Bottlecap, each sharing the Pyramid mantra.

- *bottlecap.sampler*.  A collection of Paster templates that can be
   used to bootstrap some mini-applications that are fronted by
   Bottlecap.


