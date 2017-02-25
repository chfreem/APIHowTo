//Events
document.getElementById("submitButton").addEventListener("click",getResults);
document.getElementById(0).addEventListener("click",previewImage);
document.getElementById(1).addEventListener("click",previewImage);
document.getElementById(2).addEventListener("click",previewImage);
document.getElementById(3).addEventListener("click",previewImage);
document.getElementById(4).addEventListener("click",previewImage);

//Methods
function getResults(event)
{
	//First, construct the string to send in our API request, using
	//the proper fields from the form
	var requestURL = 
		"https://catalog.archives.gov/api/v1?&resultTypes=object&rows=5";
	var queryConnector = "&q=";
	var stringToSend;
	var keyword = document.getElementById("keyword").value;
	document.getElementById("Results").textContent =
	       	"Results for keyword " + keyword;
	var stringToSend = requestURL + queryConnector + keyword;
	var req = new XMLHttpRequest();
	req.open("GET", stringToSend, true);
	req.addEventListener("load", function(){imageCallback(req)});
	req.send(null);
	event.preventDefault();
}

function previewImage(event)
{
	//  First, figure out which thumbnail was clicked
	var selectedPic = event.target;
	console.log(selectedPic.id);
	//  Then, get some custom attributes for it, which store
	//  information to populate the full-image view, title,
	//  and scope fields
	document.getElementById("preview").src =
		selectedPic.getAttribute("data-fullImgUrl");
	document.getElementById("title").textContent =
		selectedPic.getAttribute("data-title");
	document.getElementById("scope").textContent =
		selectedPic.getAttribute("data-scope");
}

function imageCallback(req)
{
	var resultsString;
	
	// turn response string into json object 
	var jsonObj =JSON.parse(req.responseText);	
	if (req.status >= 200 && req.status < 400)
	{	
		resultsArray = jsonObj.opaResponse.results.result;
		for (var i=0; i<resultsArray.length; i++)
		{
			var resultObj = jsonObj.opaResponse.results.result[i];
			var picture = document.getElementById(i);
			//  There may not be a thumbnail stored for this digital file.
			//  If there is, use it for the thumbnail.  If not, use the
			//  full url to display the entire image
			if (resultObj.objects.object.thumbnail)
			{
				picture.src = resultObj.objects.object.thumbnail["@url"];
			}
			else
			{
				picture.src = resultObj.objects.object.file["@url"];
			}
			//  I'm going to set custom attributes for each thumbnail,
			//  so that later I can use them to preview the image
			picture.setAttribute("data-fullImgUrl", 
					resultObj.objects.object.file["@url"]); 
			//  To display information about the photo, we need to
			//  do another API call to get its "parent" object, which
			//  contains a title and "scope and content" note
			getTitle(resultObj.parentDescriptionNaId,i);
		}
		resultsString = "Click on a thumbnail to see the full-size image";
	}
	else
	{
		resultsString = "Error in network request: " + req.statusText;
	}
	document.getElementById("instructions").textContent = resultsString;
}

function getTitle(parentDescriptionNaId,i)
{

	var requestURL = "https://catalog.archives.gov/api/v1?"
		var queryConnector = "&q=";
	var stringToSend = requestURL +
	       		queryConnector +
		       	String(parentDescriptionNaId);
	var req = new XMLHttpRequest();
	req.open("GET", stringToSend, true);
	req.addEventListener("load", function(){titleCallback(req,i)});
	req.send(null);
	event.preventDefault();
}

function titleCallback(req, i)
{
	var jsonObj =JSON.parse(req.responseText);	
	if (req.status >= 200 && req.status < 400)
	{
		//  This may not have information stored for its title and scope,
		//  so we need to check first
		if (jsonObj.opaResponse.results.result[0].description.item)
		{
			document.getElementById(i).setAttribute("data-title",
				jsonObj.opaResponse.results.result[0].
				description.item.title);
			document.getElementById(i).setAttribute("data-scope",
				jsonObj.opaResponse.results.result[0].
				description.item.scopeAndContentNote);
		}
		else
		{
			document.getElementById(i).setAttribute("data-title", ""); 
			document.getElementById(i).setAttribute("data-scope", "");
		}
	}
	else
	{
		console.log("Error of huge proportions!");
	}
}

