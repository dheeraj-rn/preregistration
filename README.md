# PreRegistration App
An app to simplify registation of elective subjects for students

### Prerequisites

* [Node.js](https://nodejs.org/en/download/package-manager/)
* [MongoDB](https://www.mongodb.com/)
* Apache/[Nginx](https://www.nginx.com/) server
* [PM2](http://pm2.keymetrics.io/)

## Installation

* Node.js

```bash
$ curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
$ sudo apt install -y nodejs
$ sudo apt install -y build-essential
```

* MongoDB

```bash
$ echo "deb [ arch=amd64,arm64 ] http://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/3.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.4.list
$ sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 0C49F3730359A14518585931BC711F9BA15703C6
$ sudo apt update
$ sudo apt install -y mongodb-org
$ sudo systemctl enable mongod
$ sudo service mongod start
```
