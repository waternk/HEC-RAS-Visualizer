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
<img src="screenshots/Screen Shot 2016-07-17 at 17.38.05.png" />
<img src="screenshots/Screen Shot 2016-07-19 at 11.39.48.png" />
<img src="screenshots/Screen Shot 2016-07-19 at 11.40.38.png" />
<img src="screenshots/Screen Shot 2016-07-19 at 11.39.59.png" />
