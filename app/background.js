// This is main process of Electron, started as first thing when your
// app starts. This script is running through entire life of your application.
// It doesn't have any windows which you can see on screen, but we can open
// window from here.

import { app, BrowserWindow } from "electron";
import devHelper from "./vendor/electron_boilerplate/dev_helper";
import windowStateKeeper from "./vendor/electron_boilerplate/window_state";

// require( "electron-reload" )( __dirname, {
// 	electron: require( "electron-prebuilt" )
// } );

// Special module holding environment variables which you declared
// in config/env_xxx.json file.
import env from "./src/env";

if ( env.name !== "production" ) {
	require( "electron-reload" )( __dirname );
}

// Preserver of the window size and position between app launches.
let mainWindowState = windowStateKeeper( "main", {
	width: 1000,
	height: 600
} );

app.on( "ready", function() {
	let mainWindow = new BrowserWindow( {
		x: mainWindowState.x,
		y: mainWindowState.y,
		width: mainWindowState.width,
		height: mainWindowState.height
	} );

	if ( mainWindowState.isMaximized ) {
		mainWindow.maximize();
	}

	mainWindow.loadURL( "file://" + __dirname + "/app.html" );

	if ( env.name !== "production" ) {
		devHelper.setDevMenu();
		mainWindow.openDevTools();
	}

	mainWindow.on( "close", function() {
		mainWindowState.saveState( mainWindow );
	} );
} );

if ( env.name === "production" ) {
	app.on( "window-all-closed", function() {
		app.quit();
	} );
}
