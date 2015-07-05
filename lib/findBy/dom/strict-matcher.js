var _ = require('lodash');
var S = require('string');


// analyze the pattern of the given query and lookup a matcher to process the query
module.exports = function lookup_matcher(q, app, $) {
    if (q.children === undefined && q.count === 1) {
        return _find_by_a_single_tag(q, $);
    } else if (q.children === undefined && q.count > 1) {
        return _find_by_siblings(q, $);
    } else if (q.children.length === 1) {
        return _find_by_a_single_tag_with_n_children_of_one_tag(q, app, $);
    } else if (q.children.length > 1) {
        return _find_by_a_single_tag_with_n_children_of_multiple_tags(q, $);
    } else {
        log.error('Unrecognized UI query.');
        return function () {
            return false
        }
    }
}

function _find_by_a_single_tag(q, $) {
    var selector = _get_element_name(q)

    // find a custom tag like: <com.whatsapp.*/>
    if (selector.indexOf('*') != -1) {
        var results = _.filter($('*'), function (val) {
            if ('attributes' in q && q.attributes.length > 0) {
                if (S(val.name).startsWith(q.name.split('*')[0])) {
                    var newSelector = _escapeSpecialCharacters(val.name) +
                        _escapeSpecialCharacters(_getAttributeSelectors(q.attributes));
                    return $(newSelector).length >= q.count;
                }
            }
            else {
                return S(val.name).startsWith(q.name.split('*')[0]);
            }
        });
        return results.length >= q.count
    }
    if ('min' in q) {
        $(selector).length > q.min;
    } else if ('max' in q) {
        $(selector).length < q.count;
    } else if ('exactly' in q) {
        $(selector).length == q.exactly;
    }
    return $(selector).length >= q.count
}

function _find_by_a_single_tag_with_n_children_of_one_tag(q, app, dom) {
    var $ = dom || app
    var selector = _get_element_name(q)
    var childName = _get_child_name(q.children[0])
    var childCount = q.children[0].count
    var result
    if (typeof $ === 'function') {
        // Find each selector that is nth in relation to its sibling selector with the same element name.
        result = (childName === '*') ? $(selector + ' > ' + childName) :
            $(selector + ' > ' + childName + ':nth-of-type(' + childCount + ')')
    }
    else {
        result = $.children(childName);
    }
    if ('children' in q.children[0] && result.length >= childCount) {
        return _find_by_a_single_tag_with_n_children_of_one_tag(q.children[0], result)
    }
    return result.length >= childCount
}

function _find_by_a_single_tag_with_n_children_of_multiple_tags(q, $) {
    // Find the children of the single tag and count their children
    // as siblings of each other.
    // Example: $('LinearLayout').children('ImageView ~ RatingBar')
    var selector = _get_element_name(q);
    var childrenNames = new Array();
    _.forEach(q.children, function (child) {
        var fullChildName = _get_child_name(child) + " ";
        childrenNames.push(_.repeat(fullChildName + " ~ ", child.count));
    });
    // Join the array and remove the last four characters for " ~ "
    var querySiblings = childrenNames.join('').slice(0, -4);
    return $(selector).children(querySiblings).length >= 1
}

function _find_by_siblings(q, $) {
    var selector = _get_element_name(q)
    var result = $(selector + ':nth-of-type(' + q.count + ')')
    return result.length > 0
}

function _get_element_name(element) {
    var selector = element.name
    if (selector == '_') {
        selector = '*'
    }
    if ('attributes' in element) {
        var actualAttributes = _filterExtraAttributes(element.attributes)
        selector += _getAttributeSelectors(actualAttributes)
    }
    selector = _escapeSpecialCharacters(selector)
    return selector
}

function _get_child_name(child) {
    var childName = child.name
    if (childName == '_') {
        childName = '*'
    }
    if ('attributes' in child) {
        var actualAttributes = _filterExtraAttributes(child.attributes)
        childName += _getAttributeSelectors(actualAttributes)
    }
    if (childName != '*') {
        childName = _escapeSpecialCharacters(childName)
    }
    return childName;
}

function _getAttributeSelectors(attributes) {
    var attributesSelector = ''
    _.forEach(attributes, function (attrib) {
        var idx = attrib['value'].indexOf('*');
        // Attribute value equals to a value
        if (idx == -1) {
            var attribText = '[' + (attrib.name) +
                '="' + (attrib.value) + '"]';
            attributesSelector += attribText
        }
        // Attribute value starts with a value
        else if (idx == attrib['value'].length - 1) {
            var attribText = '[' + (attrib.name)
                + '^="' + (attrib.value.split('*')[0]) + '"]';
            attributesSelector += attribText
        }
        // Attribute value ends with a value
        else if (idx == 0) {
            var attribText = '[' + (attrib.name) +
                '$="' + (attrib.value.split('*')[1]) + '"]';
            attributesSelector += attribText
        }
    })
    return attributesSelector;
}

function _filterExtraAttributes(attributes) {
    return _.filter(attributes, function (attrib) {
        return attrib.name != '__name'
    })
}

/**
 * Escape names that use any of JQuery meta-characters as a literal part of a name.
 * @param str a String that may use any of the meta-characters
 * @returns {String} The escaped string with two backslashes replacing the
 * JQuery's special meta-characters
 * @private
 */
function _escapeSpecialCharacters(str) {
    var r = str.replace(/([;&,\.\+\*\~':"\!\^#$%@\[\]\(\)=>\|])/g, '\$1');
    return r.replace(/(:|\.)/g, "\\$1");
}