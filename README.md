# PreRegistration App
An app to simplify registation of elective subjects for students


### Prerequisites

* [Node.js](https://nodejs.org/en/download/package-manager/)
* [MongoDB](https://www.mongodb.com/)
* Apache server
* [PM2](http://pm2.keymetrics.io/)


## Installation

* Node.js

```
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
sudo apt install -y nodejs
sudo apt install -y build-essential
```


* MongoDB

```
echo "deb [ arch=amd64,arm64 ] http://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/3.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.4.list
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 0C49F3730359A14518585931BC711F9BA15703C6
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl enable mongod
sudo service mongod start
```


* Apache as reverse proxy

A reverse proxy is a type of proxy server that takes HTTP(S) requests and transparently distributes them to one or more backend servers. Reverse proxies are useful because many modern web applications process incoming HTTP requests using backend application servers which aren't meant to be accessed by users directly and often only support rudimentary HTTP features.

You can use a reverse proxy to prevent these underlying application servers from being directly accessed. They can also be used to distribute the load from incoming requests to several different application servers, increasing performance at scale and providing fail-safeness. They can fill in the gaps with features the application servers don't offer, such as caching, compression, or SSL encryption too.


  1. Apache

  ```
  sudo apt install -y apache2
  sudo cp /etc/apache2/sites-available/000-default.conf /etc/apache2/sites-available/preregistration.conf
  sudo nano /etc/apache2/sites-available/preregistration.conf
  ```

  Add the following lines in preregistration.conf

  ```
  ServerName *domain name*
	ServerAlias *domain name*
	ServerAdmin webmaster@localhost
	DocumentRoot /var/www/html/preregistration
	ProxyPreserveHost On
	ProxyPass / http://127.0.0.1:8081/
	ProxyPassReverse / http://127.0.0.1:8081/
  ```

  ```
  sudo a2dissite 000-default.conf
  sudo a2ensite preregistration.conf
  sudo a2enmod proxy_http
  sudo apachectl restart
  ```


* PM2

**PM2** is a process manager for Node.js applications. PM2 provides an easy way to manage and daemonize applications (run them in the background as a service).

```
sudo npm install -g pm2
```

The **-g** option tells npm to install the module globally, so that it's available system-wide.

Applications that are running under PM2 will be restarted automatically if the application crashes or is killed, but an additional step needs to be taken to get the application to launch on system startup (boot or reboot). Luckily, PM2 provides an easy way to do this, the startup subcommand.

The startup subcommand generates and configures a startup script to launch PM2 and its managed processes on server boots:

```
pm2 startup systemd
```

The last line of the resulting output will include a command that you must run with superuser privileges. Run the command that was generated to set PM2 up to start on boot. This will create a systemd unit which runs pm2 for your user on boot. You can check the status of the systemd unit with systemctl:

```
systemctl status pm2-sammy
```


* Installing PreRegistration app

```
git clone https://github.com/dheeraj-rn/preregistration.git
cd preregistration
npm install
cd ..
sudo mv preregistration /var/www/html/
pm2 start /var/www/html/preregistration/index.js --name "preregistration"
```
