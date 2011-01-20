import os

from setuptools import setup, find_packages

here = os.path.abspath(os.path.dirname(__file__))
README = open(os.path.join(here, 'README.txt')).read()
CHANGES = open(os.path.join(here, 'CHANGES.txt')).read()

requires = [
    'pyramid',
    'repoze.folder',
    'repoze.zodbconn',
    'repoze.tm2',
    'ZODB3',
    'WebError',
]

setup(name='bottlecap',
      version='0.1',
      description='bottlecap',
      long_description=README + '\n\n' +  CHANGES,
      classifiers=[
        "Programming Language :: Python",
        "Framework :: Pylons",
        "Topic :: Internet :: WWW/HTTP",
        "Topic :: Internet :: WWW/HTTP :: WSGI :: Application",
        ],
      author='',
      author_email='',
      url='',
      keywords='web pylons pyramid',
      packages=find_packages(),
      include_package_data=True,
      zip_safe=False,
      install_requires = requires,
      tests_require= requires,
      test_suite="bottlecap",
      entry_points = """\
      [paste.app_factory]
      main = bottlecap:main
      """,
      paster_plugins=['pyramid'],
     )
