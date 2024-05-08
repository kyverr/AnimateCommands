genJson(window);

// docs: https://help.adobe.com/archive/en_US/flash/cs5/flash_cs5_extending.pdf



var sel = fl.getDocumentDOM().library.getSelectedItems();

if (sel.length == 0 || confirm("Use scene root instead of library selection?")) {
	var layers = getAllLayers();
	if (layers != null)
		execute(layers);
}
else {
	for (var i = 0; i < sel.length; i++) {

		var tl = sel[i].timeline;
		var counter = {};
		var t = [];

		for (var l = tl.layers.length - 1; l > -1; l--) {
			var elements = tl.layers[l].frames[0].elements;
			AppendElements(elements, t, counter);
		}



		var json = JSON.stringify({ data: t });
		//fl.trace(json);
		prompt("Output", json);
	}
}

function execute(layers) {
	var counter = {};
	var t = [];

	for (var l = layers.length - 1; l > -1; l--) {
		var elements = layers[l].frames[0].elements;
		AppendElements(elements, t, counter);
	}

	var json = JSON.stringify({ data: t });
	//fl.trace(json);
	prompt("Output", json);
}

function getAllLayers() {
    var doc = fl.getDocumentDOM();
    var layers = [];

    if (doc != null) {
        var timeline = doc.getTimeline();
        return timeline.layers;
    } else {
        alert("No document is open.");
    }

    return layers;
}


function AppendElements(elements, t, counter) {

	for (var z = 0; z < elements.length; z++) {
		var el = elements[z];
		var newObj = {};

		if (!el.libraryItem) {
			fl.trace("Skipping an element because it is not a library item");
			continue;
		}

		if (counter[el.libraryItem.name] == null) {
			counter[el.libraryItem.name] = 1;
		} else {
			counter[el.libraryItem.name]++;
		}

		newObj.name = el.libraryItem.name + "-" + counter[el.libraryItem.name];
		newObj.x = el.x;
		newObj.y = el.y;

		if (el.skewX !== 0 || el.skewY !== 0) {
            // Calculate rotation from skew
            newObj.r = el.skewX; // Average of X and Y skew
        } else {
            newObj.r = el.rotation;
        }

		if (el.scaleX != 1) newObj.scaleX = el.scaleX;
		if (el.scaleY != 1) newObj.scaleY = el.scaleY;

		if (isNaN(newObj.r) || newObj.r == 0) delete newObj.r;
		if (isFlippedHorizontally(el)) newObj.flip = true;

		t.push(newObj);

	}
}





function isFlippedHorizontally(element) {
	return Math.round(getFlip(element)[0]) == -1;
}

function isFlippedVertically(element) {
	return Math.round(getFlip(element)[0]) == -1;
}

function getFlip(element) {
	var rotationRadians;
	if (isNaN(element.rotation)) {
		rotationRadians = element.skewX * Math.PI / 180;
	}
	else {
		rotationRadians = element.rotation * Math.PI / 180;
	}

	var sinRot = Math.sin(rotationRadians);
	var cosRot = Math.cos(rotationRadians);
	var SOME_EPSILON = 0.01;
	var flipScaleX, flipScaleY;

	if (Math.abs(cosRot) < SOME_EPSILON) {
		// Avoid divide by zero. We can use sine and the other two elements of the matrix instead.
		flipScaleX = (element.matrix.b / sinRot);
		flipScaleY = (element.matrix.c / -sinRot);
	}
	else {
		flipScaleX = element.matrix.a / cosRot;
		flipScaleY = element.matrix.d / cosRot;
	}
	return [flipScaleX, flipScaleY];
}






function genJson(global) {

	/**
	*  The JSON serialization and unserialization methods
	*  @class JSON
	*/
	var JSON = {};

	JSON.prettyPrint = false;

	/**
	*  implement JSON.stringify serialization
	*  @method stringify
	*  @param {Object} obj The object to convert
	*/
	JSON.stringify = function (obj) {
		return _internalStringify(obj, 0);
	};

	function _internalStringify(obj, depth, fromArray) {
		var t = typeof (obj);
		if (t != "object" || obj === null) {
			// simple data type
			if (t == "string") return '"' + obj + '"';
			return String(obj);
		}
		else {
			// recurse array or object
			var n, v, json = [], arr = (obj && obj.constructor == Array);

			var joinString, bracketString, firstPropString;
			if (JSON.prettyPrint) {
				joinString = ",\n";
				bracketString = "\n";
				for (var i = 0; i < depth; ++i) {
					joinString += "\t";
					bracketString += "\t";
				}
				joinString += "\t";//one extra for the properties of this object
				firstPropString = bracketString + "\t";
			}
			else {
				joinString = ",";
				firstPropString = bracketString = "";
			}
			for (n in obj) {
				v = obj[n]; t = typeof (v);

				// Ignore functions
				if (t == "function") continue;

				if (t == "string") v = '"' + v + '"';
				else if (t == "object" && v !== null) v = _internalStringify(v, depth + 1, arr);

				json.push((arr ? "" : '"' + n + '":') + String(v));
			}
			return (fromArray || depth === 0 ? "" : bracketString) + (arr ? "[" : "{") + firstPropString + json.join(joinString) + bracketString + (arr ? "]" : "}");
		}
	}

	/**
	*  Implement JSON.parse de-serialization
	*  @method parse
	*  @param {String} str The string to de-serialize
	*/
	JSON.parse = function (str) {
		if (str === "") str = '""';
		eval("var p=" + str + ";"); // jshint ignore:line
		return p;
	};

	// Assign to global space
	global.JSON = JSON;

};
