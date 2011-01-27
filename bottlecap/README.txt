``bottlecap`` README
====================

This package provides two features:

- Reusable interfaces, views, utilities, and adapters which define the
  ``bottlecap`` framework.

- a sample WSGI application demonstrating use of the framework.

Install
=======

1) cd bottlecap (the directory containing bottlecap_core, bottlecap,
   etc.)

2) /path/to/virtualenv --no-site-packages .

3) cd bottlecap_core; ../bin/python ./setup.py develop

4) cd ../bottlecap_grid; ../bin/python ./setup.py develop

5) cd ../bottlecap; ../bin/python ./setup.py develop

Running
=======

1) ../bin/paster serve development.ini

2) Click ``+ File`` to add a file.

