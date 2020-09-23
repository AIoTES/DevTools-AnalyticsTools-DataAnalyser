# Data Analyser

The Data Analyser is a web application for experimenting with data analytics methods on a loaded dataset. As a tool it is strongly associated with the Data Lake and Data Analytics. The application uses html and css for the user interface, while utilising JavaScript for calling the needed services.

The current version of this tool supports the [k-means](https://en.wikipedia.org/wiki/K-means_clustering) clustering method, the [Local Outlier Factor](https://en.wikipedia.org/wiki/Local_outlier_factor) method for anomaly detection and some other simple feature extraction methods. These methods are accessible through web services that are deployed on a remore server infrastructure.

The input for all these methods is file in [JSON](https://www.json.org/) format and the results can be exported by the user in one of the following formats:
* [CSV](https://en.wikipedia.org/wiki/Comma-separated_values)
* [JSON](https://www.json.org/)
* [NVD3 JSON](http://nvd3.org/) (it is JSON with a bit modified structure, in order to be readily used in visualizations using the NVD3 library).

There is ***front-end/manual*** folder that contains guidelines of how to use the application. Morevoer, in the ***front-nd/manual/datafiles*** folder there are input files that can be used as example.

## Installation and Deployment

In order to deploy this application the easiest way is to install [XAMPP](https://www.apachefriends.org/index.html) and then copy the source code of the front-end to the **c:/xampp/htdocs/** (or whichever directory you installed XAMPP in).

The back-end runs on Node.js server, so Node.js needs to be installed.
To install the data analysis server, download this repository in a local directory and run the following command from ``back-end`` directory:

```
npm install
```

To run the server, run the following command from within the same directory:

```
node server.js
```
*Makesure that you have installed python 2.7 and the following python libraries: **scikit-learn**, **numpy**, **scipy**


## Docker deployment

You can check the [DT-AIOTES_docker](https://git.activageproject.eu/Deployment/DT-AIOTES_docker/src/master/Data%20Analyser) repository for instruction of how to deploy this application using docker.

## License

EUPL 1.2