# HEC-RAS-Visualizer

## TABLE OF CONTENTS
<!-- vscode-markdown-toc -->
* 1. [Introduction](#Introduction-0)
* 2. [Installation](#Installation-1)
* 3. [NOTE this application work only under UNIX like systems.](#NOTEthisapplicationworkonlyunderUNIXlikesystems.-2)
* 4. [Application Screenshots](#ApplicationScreenshots-3)

<!-- /vscode-markdown-toc -->

##  1. <a name='Introduction-0'></a>Introduction
This project is designed for presenting HEC-RAS geometry on the Web.  
It consists of two sub-project. The first is designed for translating HEC-RAS geometry file, written in C++. The Second is Node.js application that loads translated geometry file and presents it with a popular Three.js.
##  2. <a name='Installation-1'></a>Installation
##  3. <a name='NOTEthisapplicationworkonlyunderUNIXlikesystems.-2'></a>NOTE this application work only under UNIX like systems.
To run this program you need to complete the following steps:
<ul>
<li>Download and install the latest version of node from https://nodejs.org/en/.</li>
<li>Clone or download this repository.</li>
<li>Navigate to downloaded project directory.</li>
<li>Download three.js library from http://threejs.org and copy to public directory. </li>
<li>Make sure that you are in the project directory, and type the following commands:</br>
<pre>
sudo npm install -g bower --save
npm install
typings install
bower install
npm start</pre></li>
</li>
</ul>

##  4. <a name='ApplicationScreenshots-3'></a>Application Screenshots
<img src="screenshots/Screen Shot 2016-07-17 at 17.38.05.png" />
<img src="screenshots/Screen Shot 2016-07-17 at 17.36.03.png" />
<img src="screenshots/Screen Shot 2016-07-17 at 17.36.09.png" />
<img src="screenshots/Screen Shot 2016-07-17 at 17.35.42.png" />
