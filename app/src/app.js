// import { remote } from "electron";
// const app = remote.app;
import AppView from "./src/appView";
import Client from "digital-bible-platform";
const client = new Client( "69481ce5db7497d5ba1d16294e99a256" );

const appView = new AppView();
global.$ = require( "jquery" );
global.jQuery = global.$;
require( "bootstrap" );

let state = { loading: true, volume: "Select Bible", volumes: [], damId: "", error: null, books: [], verses: [], bookId: "", results: { total: 0, hasResults: false, results: [] } };

appView.on( "rendered", ( html ) => {
	document.getElementById( "main" ).innerHTML = html;
	registerEvents();
} );

const registerEvents = () => {
	$( "#search-form" ).submit( ( e ) => {
		e.preventDefault();
		state.searchText = $( "#search-text" ).val();
		search();
	} );

	$( ".volume-select" ).click( ( e ) => {
		e.stopPropagation();
		state.volume = $( e.target ).text();
		state.damId = e.target.id;
		loadVolume();
	} );

	$( ".book-link" ).click( ( e ) => {
		e.stopPropagation();
		state.bookId = e.target.id;
		loadBook();
	} );

	$( "#back" ).click( ( e ) => {
		e.stopPropagation();
		render( "home" );
	} );
};

const render = ( view ) => {
	console.log( "state:", state );
	appView.emit( "view-selected", { view: view, state: state } );
};

const getVolumes = () => {
	state.loading = true;
	state.volumes = [];
	state.damId = "";
	state.books = [];
	state.bookId = "";
	state.verses = [];
	render( "home" );
	client.volumes( { media: "text", language_code: "ENG", delivery: "web" }, ( err, volumes ) => {
		state.loading = false;
		if ( err ) {
			state.error = err;
			render( "home" );
		} else {
			state.volumes = volumes.filter( ( v ) => {
				return v.media_type == "Drama";
			} );
			render( "home" );
		}
	} );
};

const loadVolume = () => {
	state.loading = true;
	state.books = [];
	state.bookId = "";
	state.verses = [];
	render( "home" );
	client.books( state.damId, ( err, books ) => {
		state.loading = false;
		if ( err ) {
			state.error = err;
			render( "home" );
		} else {
			state.books = books;
			render( "home" );
		}
	} );
};

const loadBook = () => {
	state.loading = true;
	state.verses = [];
	render( "home" );
	client.verses( state.damId, { book_id: state.bookId }, ( err, verses ) => {
		state.loading = false;
		if ( err ) {
			state.error = err;
			render( "home" );
		} else {
			let mapped = [];
			let lastBook = "";
			let lastChapter = "0";
			for ( let i = 0; i < verses.length; i++ ) {
				const v = verses[i];
				let item = { id: v.verse_id, text: v.verse_text };
				if ( lastBook !== v.book_name ) {
					item.book = v.book_name;
					lastBook = v.book_name;
				}
				if ( lastChapter !== v.chapter_id ) {
					item.chapter = v.chapter_title;
					lastChapter = v.chapter_id;
				}
				mapped.push( item );
			}
			state.verses = mapped;
			render( "home" );
		}
	} );
};

const search = () => {
	state.loading = true;
	state.results = { total: 0, results: [], hasResults: false };
	render( "search" );
	client.textSearch( state.damId, { query: escape( state.searchText ) }, ( err, res ) => {
		state.loading = false;
		if ( err ) {
			state.error = err;
			render( "search" );
		} else {
			const results = { total: res[0][0].total_results, results: res[1], hasResults: res[1].length > 0 };

			state.results = results;
			render( "search" );
		}
	} );
};

document.addEventListener( "DOMContentLoaded", () => {
	render( "home" );
	getVolumes();
} );

