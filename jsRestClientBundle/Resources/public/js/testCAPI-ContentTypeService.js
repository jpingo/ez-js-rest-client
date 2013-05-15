// Some simple js REST CAPI Content Type Service usage scenario

var contentTypeService = jsCAPI.getContentTypeService();
var clientOutput = document.getElementById('output');

// ******************************
// ******************************

// Create content type group example
var CreateContentTypeGroupAnchor = document.getElementById('create-contenttype-group');
var CreateContentTypeGroupLoader = document.getElementById('create-contenttype-group-loader');
CreateContentTypeGroupAnchor.onclick = function(e){

    CreateContentTypeGroupLoader.style.display = 'block';
    e.preventDefault();

    var contentTypeGroupCreateStruct = contentTypeService.newContentTypeGroupInputStruct(
        "some-group-id" + Math.random(100),
        "eng-US"
    );

    contentTypeService.createContentTypeGroup(
        "/api/ezp/v2/content/typegroups",
        contentTypeGroupCreateStruct,
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                "Status : " + response.status + "</br>" +
                "Body : " + response.body;
            CreateContentTypeGroupLoader.style.display = 'none';
        });
};


// Load content type groups list example
var loadContentTypeGroupsAnchor = document.getElementById('load-contenttype-groups');
var loadContentTypeGroupsLoader = document.getElementById('load-contenttype-groups-loader');
loadContentTypeGroupsAnchor.onclick = function(e){

    loadContentTypeGroupsLoader.style.display = 'block';
    e.preventDefault();

    contentTypeService.loadContentTypeGroups(
        '/api/ezp/v2/content/typegroups',
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                "Status : " + response.status + "</br>" +
                "Body : " + response.body;
            loadContentTypeGroupsLoader.style.display = 'none';
        }
    );
};

// Load single content type group example
var loadContentTypeGroupAnchor = document.getElementById('load-contenttype-group');
var loadContentTypeGroupLoader = document.getElementById('load-contenttype-group-loader');
loadContentTypeGroupAnchor.onclick = function(e){

    loadContentTypeGroupLoader.style.display = 'block';
    e.preventDefault();

    var loadContentTypeGroupInput = document.getElementById('load-contenttype-group-input');
    if (loadContentTypeGroupInput.value.length){
        contentTypeService.loadContentTypeGroup(
            loadContentTypeGroupInput.value,
            function(error, response){
                clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                    "Status : " + response.status + "</br>" +
                    "Body : " + response.body;
                loadContentTypeGroupLoader.style.display = 'none';
            }
        );
    } else {
        clientOutput.innerHTML = 'Id is missing!';
    }
};

// Update content type group example
var UpdateContentTypeGroupAnchor = document.getElementById('update-contenttype-group');
var UpdateContentTypeGroupLoader = document.getElementById('update-contenttype-group-loader');
UpdateContentTypeGroupAnchor.onclick = function(e){

    UpdateContentTypeGroupLoader.style.display = 'block';
    e.preventDefault();

    var contentTypeGroupUpdateStruct = contentTypeService.newContentTypeGroupInputStruct(
        "some-group-id" + Math.random(100),
        "eng-US"
    );

    var updateContentTypeGroupInput = document.getElementById('update-contenttype-group-input');
    contentTypeService.updateContentTypeGroup(
        updateContentTypeGroupInput.value,
        contentTypeGroupUpdateStruct,
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                "Status : " + response.status + "</br>" +
                "Body : " + response.body;
            UpdateContentTypeGroupLoader.style.display = 'none';
        });
};

// Delete content type group example
var DeleteContentTypeGroupAnchor = document.getElementById('delete-contenttype-group');
var DeleteContentTypeGroupLoader = document.getElementById('delete-contenttype-group-loader');
DeleteContentTypeGroupAnchor.onclick = function(e){

    DeleteContentTypeGroupLoader.style.display = 'block';
    e.preventDefault();

    var DeleteContentTypeGroupInput = document.getElementById('delete-contenttype-group-input');
    if (DeleteContentTypeGroupInput.value.length){
        contentTypeService.deleteContentTypeGroup(
            DeleteContentTypeGroupInput.value,
            function(error, response){
                clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                    "Status : " + response.status + "</br>" +
                    "Body : " + response.body;
                DeleteContentTypeGroupLoader.style.display = 'none';
            }
        );
    } else {
        clientOutput.innerHTML = 'Id is missing!';
    }
};

// List content type for a group example
var LoadContentTypesAnchor = document.getElementById('load-content-types');
var LoadContentTypesLoader = document.getElementById('load-content-types-loader');
LoadContentTypesAnchor.onclick = function(e){

    LoadContentTypesLoader.style.display = 'block';
    e.preventDefault();

    var LoadContentTypesInput = document.getElementById('load-content-types-input');
    if (LoadContentTypesInput.value.length){
        contentTypeService.loadContentTypes(
            LoadContentTypesInput.value,
            function(error, response){
                clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                    "Status : " + response.status + "</br>" +
                    "Body : " + response.body;
                LoadContentTypesLoader.style.display = 'none';
            }
        );
    } else {
        clientOutput.innerHTML = 'Id is missing!';
    }
};


// Create content type example
var CreateContentTypeAnchor = document.getElementById('create-content-type');
var CreateContentTypeLoader = document.getElementById('create-content-type-loader');
CreateContentTypeAnchor.onclick = function(e){

    CreateContentTypeLoader.style.display = 'block';
    e.preventDefault();

    var contentTypeCreateStruct = contentTypeService.newContentTypeCreateStruct(
        "content-type-id-" + Math.random(100),
        "eng-US",
        [
            {
                "_languageCode":"eng-US",
                "#text":"Some Name " + Math.random(10000)
            }
        ],
        "DummyUser"
    );

    var fieldDefinition = contentTypeService.newFieldDefinitionCreateStruct(
        "fd-id-" + Math.random(100),
        "ezstring",
        "content",
        [
            {
                "_languageCode":"eng-US",
                "#text":"Some FD Name " + Math.random(10000)
            }
        ]
    );

    contentTypeCreateStruct.body.ContentTypeCreate.FieldDefinitions.FieldDefinition.push(fieldDefinition.body.FieldDefinitionCreate);

    contentTypeService.createContentType(
        "/api/ezp/v2/content/typegroups/1",
        contentTypeCreateStruct,
        true,
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                "Status : " + response.status + "</br>" +
                "Body : " + response.body;
            CreateContentTypeLoader.style.display = 'none';
        }
    );
};

// Load content type example
var LoadContentTypeAnchor = document.getElementById('load-content-type');
var LoadContentTypeLoader = document.getElementById('load-content-type-loader');
LoadContentTypeAnchor.onclick = function(e){

    LoadContentTypeLoader.style.display = 'block';
    e.preventDefault();

    var LoadContentTypeInput = document.getElementById('load-content-type-input');
    if (LoadContentTypeInput.value.length){
        contentTypeService.loadContentType(
            LoadContentTypeInput.value,
            function(error, response){
                clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                    "Status : " + response.status + "</br>" +
                    "Body : " + response.body;
                LoadContentTypeLoader.style.display = 'none';
            }
        );
    } else {
        clientOutput.innerHTML = 'Id is missing!';
    }
};

// Load content type by identifier example
var LoadContentTypeByIdentifierAnchor = document.getElementById('load-content-type-by-identifier');
var LoadContentTypeByIdentifierLoader = document.getElementById('load-content-type-by-identifier-loader');
LoadContentTypeByIdentifierAnchor.onclick = function(e){

    LoadContentTypeByIdentifierLoader.style.display = 'block';
    e.preventDefault();

    var LoadContentTypeByIdentifierInput = document.getElementById('load-content-type-by-identifier-input');
    if (LoadContentTypeByIdentifierInput.value.length){
        contentTypeService.loadContentTypeByIdentifier(
            LoadContentTypeByIdentifierInput.value,
            function(error, response){
                clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                    "Status : " + response.status + "</br>" +
                    "Body : " + response.body;
                LoadContentTypeByIdentifierLoader.style.display = 'none';
            }
        );
    } else {
        clientOutput.innerHTML = 'Id is missing!';
    }
};

// Copy content type example
var CopyContentTypeAnchor = document.getElementById('copy-content-type');

console.log(CopyContentTypeAnchor);

var CopyContentTypeLoader = document.getElementById('copy-content-type-loader');
CopyContentTypeAnchor.onclick = function(e){

    CopyContentTypeLoader.style.display = 'block';
    e.preventDefault();

    var CopyContentTypeInput = document.getElementById('copy-content-type-input');
    if (CopyContentTypeInput.value.length){
        contentTypeService.copyContentType(
            CopyContentTypeInput.value,
            function(error, response){
                clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                    "Status : " + response.status + "</br>" +
                    "Body : " + response.body;
                CopyContentTypeLoader.style.display = 'none';
            }
        );
    } else {
        clientOutput.innerHTML = 'Id is missing!';
    }
};

// Create content type draft example
var CreateContentTypeDraftAnchor = document.getElementById('create-content-type-draft');
var CreateContentTypeDraftLoader = document.getElementById('create-content-type-draft-loader');
CreateContentTypeDraftAnchor.onclick = function(e){

    CreateContentTypeDraftLoader.style.display = 'block';
    e.preventDefault();

    var contentTypeUpdateStruct = contentTypeService.newContentTypeUpdateStruct();

    contentTypeUpdateStruct.names = {};
    contentTypeUpdateStruct.names.value = [
        {
            "_languageCode":"eng-US",
            "#text":"Some new FD Name " + Math.random(10000)
        }
    ];


    var CreateContentTypeDraftInput = document.getElementById('create-content-type-draft-input');
    if (CreateContentTypeDraftInput.value.length){
        contentTypeService.createContentTypeDraft(
            CreateContentTypeDraftInput.value,
            contentTypeUpdateStruct,
            function(error, response){
                clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                    "Status : " + response.status + "</br>" +
                    "Body : " + response.body;
                CreateContentTypeDraftLoader.style.display = 'none';
            }
        );
    } else {
        clientOutput.innerHTML = 'Id is missing!';
    }
};