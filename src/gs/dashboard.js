let onOpen = () => {
	SpreadsheetApp.getActiveSpreadsheet().addMenu('Admin', [
		{ name: 'Update images', functionName: 'updateImgId' }
	]);
}
let updateImgId = () => {
	let files = getFiles(),
		sheet = SpreadsheetApp.getActive();
	sheet.getSheets().forEach(list => {
		list.getRange('K1:L10000').clear();
		for (let i=0; i<list.getDataRange().getNumRows(); ++i) {
            let v = list.getRange('G'+(i+1)).getValue();
			list.getRange('K'+(i+1)).setValue((i == 0) ? 'imgId' : (files[v].id || null));
			list.getRange('L'+(i+1)).setValue((i == 0) ? 'imgUrl' : (files[v].url || null));
            delete files[v];
		}
	});
    let nuf = Object.keys(files);
    if (nuf.length)
      console.log('not used', nuf);
}
let getFiles = () => {
	let files = {},
		folders = DriveApp.getFileById(getId()).getParents().next().getFolders();
	while (folders.hasNext()) {
		let folder = folders.next(),
			images = folder.getFiles();
		while (images.hasNext()) {
			let image = images.next(),
                id = image.getId();
            files[folder.getName()+'/'+image.getName()] = {
              id: id,
              url: Drive.Files.get(id).thumbnailLink.split('=s')[0]
            };
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
