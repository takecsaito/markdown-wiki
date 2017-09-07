$(function(){

  // Marked options.
  marked.setOptions({
    // For syntax highlighting.
    langPrefix: '',
    highlight: function( code, lang ){
      return hljs.highlightAuto( code, [lang] ).value;
    }
  });

  // デフォルトは`index.md`とする
  if ( !location.hash ) location.hash = "index.md"

  // location.hash で指定した Markdown ファイルを読み込む
  $.ajax( {
    url : location.hash.substr( 1 ),
    dataType : 'text'
  } ).done( function( data ){
    // Generate TOC.
    TOCGenerator.run( data );
    // Convert Markdown to HTML.
    $( '#contents' ).html( marked( data ) );
  } ).fail( function( f ){
    console.log( f );
  });

  // nav.md を読み込む
  $.ajax( {
    url      : 'nav.md',
    dataType : 'text'
  } ).done( function( data ){
    // Convert Markdown to HTML.
    let html = marked( data );
    html = html
      // navbar
      .replace( /<h1 id=".+">/, '<div class="navbar-header"><a class="navbar-brand" href="#">' )
      .replace( '</h1>', '</a></div">' )
      .replace( '<ul>', '<ul class="nav navbar-nav">' )
      // divider
      .replace( /<li><hr>/g, '<li class="divider">' )
      // dropdown-header
      .replace( /<h1/g, '<h1 class="dropdown-header"' )

    $( 'nav > div.container' ).html( html );
    $( 'ul.nav > li:has("ul") > a' )
      .addClass( 'dropdown-toggle' )
      .attr    ( 'data-toggle', 'dropdown' )
      .append  ( ' <span class="caret"></span>' );
    $( 'nav ul li ul' ).addClass( 'dropdown-menu' );
    $( '.navbar-nav a' ).each( function(){
      $( this ).attr( 'href', 'index.html#' + $( this ).attr( 'href' ) );
    });
  } ).fail( function( f ){
    console.log( f );
  });

  // 目次クリック時にページ内移動する
  $( document ).on( 'click', '#toc a', function () {
    let hash = this.href.substr( this.href.lastIndexOf('#') + 1 );
    let h = $( ":header:contains('" + hash + "')" );
    $( 'html, body' ).animate( { scrollTop: h.offset().top }, 'fast' );
    return false;
  })
});

class Item {
  constructor( title ){
    this._title = title;
    this._children = [];
    this._parent = null;
  }
  get title() {
    return this._title;
  }
  set title( value ) {
    this._title = value;
  }
  get children() {
    return this._children;
  }
  get parent() {
    return this._parent;
  }
  set parent( item ) {
    this._parent = item;
  }

  generateHtml(){
    let url = location.hash.substr(1) + "#" + this.title
    let $li = $( '<li>' ).html( '<a href="#' + url + '">' + this.title + '</a>' );
    if ( this.children.length > 0 ) {
      let $ol = $( '<ol>' );
      this.children.forEach( function( val, idx, arr ){
        $ol.append( val.generateHtml() );
      });
      $li.append( $ol );
    }
    return $li;
  }
}

class TOCGenerator {
  static run( contents ){
    // Generate item tree.
    let root = new Item( 'root' );
    let current = []; current[0] = root;
    let level = 0;
    let headerCount = 0;
    // Split with return code.
    contents.split( /\r\n|\r|\n/ ).forEach( function ( val, idx, arr ) {
      if ( val.startsWith( '#') ) {
        let tmp_level = val.match(/^#+/)[0].length;
        let item = new Item( val.substr( tmp_level + 1 ) );
        if ( tmp_level > level ) {
          current[level].children.push( item );
          item.parent = current[level];
          current[tmp_level] = item;
        } else if ( tmp_level == level ) {
          current[tmp_level].parent.children.push( item );
          item.parent = current[tmp_level].parent;
          current[tmp_level] = item;
        } else {
          current[tmp_level].parent.children.push( item );
          item.parent = current[tmp_level].parent;
          current[tmp_level] = item;
        }
        level = tmp_level;
        headerCount++;
      }
    });

    // Convert item tree to html.
    if ( headerCount >= 5 ) {
      $( '#toc' ).addClass( 'col-md-3' );
      $( 'div#toc' ).append( root.generateHtml().children('ol') );
    }
  }
}

