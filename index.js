var str = '#this #is__ __#a test###__';
console.log(str.replace(/#|_/g,'')); // result: "this is a test"

