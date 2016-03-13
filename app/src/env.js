import jetpack from "fs-jetpack";

const app = ( process.type === "renderer" ) ? require( "electron" ).remote.app : require( "electron" ).app;
const appDir = jetpack.cwd( app.getAppPath() );
const manifest = appDir.read( "package.json", "json" );

export default manifest.env;
