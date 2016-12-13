# TREXMO

TREXMO (TRanslation of EXposure MOdels) is a peer-reviewed exposure assessment tool developed in collaboration with the Institut Universitaire Romand de Santé au Travail (IST) from Lausanne and the University of Geneva.

The tool is primarily developed to efficiently and reliably assess the wide variety of exposure situations using the available occupational exposure models.
It integrates six commonly used occupational exposure models: **ART v.1.5**, **STOFFENMANAGER® v.5.1**, **ECETOC TRA v.3**, **MEASE v.1.02.01, EMKG-EXPO-TOOL** and **EASE v.2.0**.
It also includes a semi-automatic translation engine that is capable of efficiently translating a defined set of parameters from a given exposure situation in one of the models to the most appropriate corresponding parameters in the other exposure models.
This method harmonizes the use of different models for the same exposure situation and reduces the uncertainties related to the use of these models.
Ultimately, TREXMO should contribute to more reliable exposure estimations for exposure scenarios of concern.

## References

- [TREXMO: A Translation Tool to Support the Use of Regulatory Occupational Exposure Models](http://annhyg.oxfordjournals.org/content/early/2016/06/29/annhyg.mew042.abstract?keytype=ref&ijkey=ondMCzkcGybok3D)
- [Guidance on information requirements and chemical safety assessment. Chapter R.14: Occupational exposure estimation](https://echa.europa.eu/documents/10162/13632/information_requirements_r14_en.pdf)

## Installation

Here is a tutorial that should help you run a TREXMO server on your machine.
Note that only unix-based systems are currently officially supported.
Hence, this guide won't cover Windows operation systems.

### Prerequisites

As prerequisites , the remaining of this guide expects that you have [Python 3.4](https://www.python.org), [pip](https://pip.pypa.io/en/latest/installing.html) and [npm](https://www.npmjs.com) installed on your system.

Additionally, it is recommended to run TREXMO in its own virtual environment, so you may install [virtualenv](http://www.virtualenv.org/en/latest/) as well.
Then, you may create an environment wherever you like, for instance:

```
virtualenv /opt/trexmo/venv
source /opt/trexmo/venv/bin/activate
```

### Install Server Dependencies

The root directory of TREXMO contains a file named `requirements.txt` that specifies all the requirements of the server.
You can install those with `pip`:

```
pip install -r requirements.txt
```

> Note that the server should always be developed, tested and executed against the dependencies (at their specified version) described in `requirements.txt`.
> Thus, when a developer decides to add, remove or modify those dependencies, the aforementioned file should be modified accordingly.
> We invite the reader to consult [documentation of pip](https://pip.pypa.io/en/latest/user_guide.html#requirements-files) for more information about `requirements.txt` and its format.

For performance reasons, the server also relies on a caching backend.
By default, TREXMO will try to reach a [Redis](https://redis.io) server, which is the recommanded caching backend.
The installation of Redis hugely depends on your operating system, so we will not cover it here.
However, for test purposes **only**, a bash script has been made available in TREXMO's repository that allows you to quickly install and run a Redis server in your terminal.
In can be found under the `scripts` directory.

If for whatever reason you would like to change the caching backend, you can update TREXMO's settings (located in `trexmo/settings.py`) and change the keys related to the caching backend.
The supported backends are listed here: [configuring Flask-Cache](https://pythonhosted.org/Flask-Cache/#configuring-flask-cache).

### Install User Interface Dependencies

We use [`npm`](https://www.npmjs.com) to build the User Interface (UI), as well as to download and build its dependencies.
A set of commands have been made available to simplify the mangement of the UI files.
As a result, you can simply type the following command (from the root of TREXMO's repository) to install all dependencies:

```
python manage.py gui install
```

### Compile the User Interface

The requires compilation.
This can be done with the following command:

```
python manage.py gui build
```

> Note that this command will build the optimized (ie. minified) version of the UI.
> If you run TREXMO's server in debug mode (see below), the UI will try to load the debug version (ie. non-minified) and will fail.
To build the debug version of the UI, append `--debug` to the above command.

During the development and/or maintenance of the code, you may want to *watch* the source files and recompile them automatically when they are modified.
You can achieve this with the following command:

```
python manage.py gui watch
```

> Note that this watching source files will always build the debug version of the UI.

### Initialize the Database

TREXMO's server requires its database to be initialized before it can run.
By default, TREXMO uses a file-based database (using [SQLite](https://www.sqlite.org)) and will try to write it in a directory named `data/`, at the root of the repository directory.
You need to create such directory, before initializing the database:

```
mkdir data/
python manage.py db sync
```

If for whatever reason you would like to change the database backend, you can update TREXMO's settings (located in `trexmo/settings.py`) and change the keys related to SQLAlchemy.
The supported backends are listed here: [SQLAlchemy Dialects](http://docs.sqlalchemy.org/en/latest/dialects/index.html).

> Note that some database backends may require the installation of some additional dependencies.
> We invite the reader to consult SQLAlchemy's documentation for more information about it.

Finally, once the database created, a user must be created.
The following command can be used, and will ask for a password.

```
python manage.py user add <some username>
```

### Install Model Sources

The model sources, written in DDTL, must be made available to th TREXMO server before it can run.
You can do that by copying `.fdf`, `.mdf` and `.tdf` files in directories named respectively `data/forms/`, `data/models/` and `data/translations/`.
Those directories do not exist by default, and must be created manually:

```
mkdir data/forms/ data/models/ data/translations
```

You should also create also a `scenarii`, so that TREXMO can save the exposure situations:

```
mkdir data/scenarii/
```

### Run the Server

Once all the above installation and configuration have been made, you can finally run the server.
Simply run that command to achieve that:

```
python manage.py server run
```

### Troubleshooting

You can run TREXMO in debug mode with the following command:

```
python manage.py server run --debug
```

Under debug mode, TREXMO will log the stack trace of any uncaught exception to the console.
The error will be reported to the client too, as a HTML page containing the stack trace and an AJAX based debugger (which allows to execute code in the context of the traceback's frame).
We invite the reader to consult the [documentation of Werkzeug](http://werkzeug.pocoo.org/docs/0.11/debug/) for more information about the AJAX debugger.

For obvious security reasons, be sure to never expose your TREXMO server in debug mode to the Internet.
