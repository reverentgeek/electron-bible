import fs from "fs";
import path from "path";
import Handlebars from "handlebars";

export default class View {
	constructor( viewName ) {
		this.viewName = viewName;
		this.templatePath = path.join( __dirname, "../views", this.viewName + ".hbs" );
		this.source = fs.readFileSync( this.templatePath, "utf-8" );
		this.template = Handlebars.compile( this.source );
		this.registerHelpers();
	}
	registerHelpers() {
		Handlebars.registerHelper( "isEqual", ( expectedValue, value ) => {
			return value === expectedValue;
		} );

		Handlebars.registerHelper( "list", ( items, options ) => {
			if ( !items ) {
				return "";
			}

			let out = "<ul>";

			for ( let i = 0, l = items.length; i < l; i++ ) {
				out = out + `<li>${options.fn( items[i] )}</li>`;
			}

			return out + "</ul>";
		} );
	}
	toHtml( data ) {
		return this.template( data );
	}

}
