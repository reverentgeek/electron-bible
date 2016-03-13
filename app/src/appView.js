const EventEmitter = require( "events" ).EventEmitter;
import View from "./view";

export default class AppView extends EventEmitter {
	constructor() {
		super();
		this.on( "view-selected", ( { view, state } ) => {
			this.view = new View( view );
			this.emit( "rendered", this.view.toHtml( state ) );
		} );
	}
}
