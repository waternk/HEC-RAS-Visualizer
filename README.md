<h1>HEC-RAS-Visualizer</h1>
<h1>Table of Contents</h1>
<!-- TOC depthFrom:1 depthTo:6 insertAnchor:false orderedList:false updateOnSave:true withLinks:true -->

- [Introduction](#introduction)
- [Installation](#installation)
- [Application Screenshots](#application-screenshots)

<!-- /TOC -->

# Introduction
This project is designed for presenting HEC-RAS geometry on the Web.  
It consists of two sub-project. The first is designed for translating HEC-RAS geometry file, written in C++. The Second is Node.js application that loads translated geometry file and presents it with Three.js library.</br>
<b>NOTE: This application work only under *NIX like systems for now.</b>
# Installation
To run this program you need to complete the following steps:
<ul>
<li>Download and install the latest version of node from https://nodejs.org/en/.</li>
<li>Clone or download this repository.</li>
<li>Navigate to downloaded project directory.</li>
<li>Download Three.js library from http://threejs.org and copy to public directory. </li>
<li>Make sure that you are in the project directory, and type the following commands:</br>
<pre>
sudo npm install -g bower --save
npm install
typings install
bower install
npm start</pre></li>
</li>
</ul>
# Application Screenshots

<img src="screenshots/Screen Shot 2016-07-21 at 23.23.18.png" />
<img src="screenshots/Screen Shot 2016-07-20 at 11.51.54.png" />
<img src="screenshots/Screen Shot 2016-07-21 at 23.23.28.png" />
<img src="screenshots/Screen Shot 2016-07-21 at 23.23.33.png" />
<img src="screenshots/Screen Shot 2016-07-21 at 23.23.35.png" />
<img src="screenshots/Screen Shot 2016-07-21 at 23.24.04.png" />
<img src="screenshots/Screen Shot 2016-07-21 at 23.24.12.png" />
<img src="screenshots/Screen Shot 2016-07-21 at 23.24.16.png" />