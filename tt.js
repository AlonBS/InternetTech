// user/:name/y
function transformToRegex(r, request) {

    var endsWithSlash = r.indexOf('/', r.length - 1) !== -1;
    var suffix = endsWithSlash ? '?.*$' : '/?.*$';
    var regex = new RegExp( '^' + r.replace(/(:[a-zA-Z0-9]+|\*)/g, ".*") + suffix);

    console.log(regex)
    console.log(request)

    console.log(regex.test(request))

}

//transformToRegex("/user/:name/y/z/:sss/a");
//transformToRegex("/user/");
//transformToRegex("/user");
//transformToRegex("/user/*/");

transformToRegex("/user", "/user/iosi/avi");









