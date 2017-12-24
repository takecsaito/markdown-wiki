var ERROR_CODE = '__ERROR__';
// [Underscore]
var _ = Underscore.load();
// [base folder path]
var basefolder = "memo/content/";
// [URL]
// var = "https://script.google.com/a/systena.co.jp/macros/s/AKfycbwUJlR4-3uCHnza-rPDXzBJYmjsFJo5uLa3Bk1Si7gDaxpKUmM9/exec"
var url = "https://script.google.com/a/systena.co.jp/macros/s/AKfycbzltnMN7caGU51xhXpyKJ0iM3tUHsrXmau93DwyV4hw/dev"
function doGet(e) {
  Logger.log(e);
  // template
  var t = HtmlService.createTemplateFromFile('index');
  // url
  t.url = url;
  // set data
  var data = [];
  t.data = JSON.stringify(data);
  
  // Read markdown contents.
  if(e.parameters.md)
    t.md = getFileContent(basefolder + e.parameters.md);
  else
    t.md = getFileContent(basefolder + 'index.md');
  
  // Read nav.md
  var nav = getFileContent(basefolder + 'nav.md');
  t.nav = nav == ERROR_CODE ? '' : nav; 
  
  // set title
  return t.evaluate().setTitle("テスト");
}

// Include file
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function _getObject(level, patharr, base){
  if(!base) base = DriveApp.getRootFolder();
  if(level < (patharr.length - 1))
    return _getObject(level+1, patharr, base.getFoldersByName(patharr[level]).next());
  else
    return base.getFilesByName(patharr[level]).next();
}

// Google Drive内のファイルを取得しテキストで返す
function getFileContent(path){
  try {
    var file = _getObject(0, path.toString().split("/"));
    return file.getBlob().getDataAsString();
  } catch(e) {
    Logger.log(e);
    return ERROR_CODE;
  }
}