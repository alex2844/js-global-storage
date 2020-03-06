let onOpen = () => {
	SpreadsheetApp.getActiveSpreadsheet().addMenu('Admin', [{
		name: 'Update images',
		functionName: 'updateImgId'
	}]);
}
let updateImgId = () => {
	let files = getFiles(),
		sheet = SpreadsheetApp.getActive();
	sheet.getSheets().forEach(list => {
		list.getRange('K1:K10000').clear();
		for (let i=0; i<list.getDataRange().getNumRows(); ++i) {
			list.getRange('K'+(i+1)).setValue((i == 0) ? 'imgId' : (files[list.getRange('G'+(i+1)).getValue()] || null));
		}
	});
}
let getFiles = () => {
	let files = {},
		folders = DriveApp.getFileById(getId()).getParents().next().getFolders();
	while (folders.hasNext()) {
		let folder = folders.next(),
			images = folder.getFiles();
		while (images.hasNext()) {
			let image = images.next();
			files[folder.getName()+'/'+image.getName()] = image.getId();
		}
	}
	return files;
}
let getId = () => {
	let parent = [
		SpreadsheetApp.getActiveSpreadsheet()
		// Document#App.getActiveDocument()
		// Form#App.getActiveForm()
	][0];
	if (parent)
		return parent.getId();
	return ScriptApp.getScriptId();
}
