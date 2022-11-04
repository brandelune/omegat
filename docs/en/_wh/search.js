function Snowball() {
BaseStemmer = function() {
this.setCurrent = function(value) {
this.current = value;
this.cursor = 0;
this.limit = this.current.length;
this.limit_backward = 0;
this.bra = this.cursor;
this.ket = this.limit;
};
this.getCurrent = function() {
return this.current;
};
this.copy_from = function(other) {
this.current = other.current;
this.cursor = other.cursor;
this.limit = other.limit;
this.limit_backward = other.limit_backward;
this.bra = other.bra;
this.ket = other.ket;
};
this.in_grouping = function(s, min, max) {
if (this.cursor >= this.limit) return false;
var ch = this.current.charCodeAt(this.cursor);
if (ch > max || ch < min) return false;
ch -= min;
if ((s[ch >>> 3] & (0x1 << (ch & 0x7))) == 0) return false;
this.cursor++;
return true;
};
this.in_grouping_b = function(s, min, max) {
if (this.cursor <= this.limit_backward) return false;
var ch = this.current.charCodeAt(this.cursor - 1);
if (ch > max || ch < min) return false;
ch -= min;
if ((s[ch >>> 3] & (0x1 << (ch & 0x7))) == 0) return false;
this.cursor--;
return true;
};
this.out_grouping = function(s, min, max) {
if (this.cursor >= this.limit) return false;
var ch = this.current.charCodeAt(this.cursor);
if (ch > max || ch < min) {
this.cursor++;
return true;
}
ch -= min;
if ((s[ch >>> 3] & (0X1 << (ch & 0x7))) == 0) {
this.cursor++;
return true;
}
return false;
};
this.out_grouping_b = function(s, min, max) {
if (this.cursor <= this.limit_backward) return false;
var ch = this.current.charCodeAt(this.cursor - 1);
if (ch > max || ch < min) {
this.cursor--;
return true;
}
ch -= min;
if ((s[ch >>> 3] & (0x1 << (ch & 0x7))) == 0) {
this.cursor--;
return true;
}
return false;
};
this.eq_s = function(s)
{
if (this.limit - this.cursor < s.length) return false;
if (this.current.slice(this.cursor, this.cursor + s.length) != s)
{
return false;
}
this.cursor += s.length;
return true;
};
this.eq_s_b = function(s)
{
if (this.cursor - this.limit_backward < s.length) return false;
if (this.current.slice(this.cursor - s.length, this.cursor) != s)
{
return false;
}
this.cursor -= s.length;
return true;
};
 this.find_among = function(v)
{
var i = 0;
var j = v.length;
var c = this.cursor;
var l = this.limit;
var common_i = 0;
var common_j = 0;
var first_key_inspected = false;
while (true)
{
var k = i + ((j - i) >>> 1);
var diff = 0;
var common = common_i < common_j ? common_i : common_j; 
var w = v[k];
var i2;
for (i2 = common; i2 < w[0].length; i2++)
{
if (c + common == l)
{
diff = -1;
break;
}
diff = this.current.charCodeAt(c + common) - w[0].charCodeAt(i2);
if (diff != 0) break;
common++;
}
if (diff < 0)
{
j = k;
common_j = common;
}
else
{
i = k;
common_i = common;
}
if (j - i <= 1)
{
if (i > 0) break; 
if (j == i) break; 
if (first_key_inspected) break;
first_key_inspected = true;
}
}
do {
var w = v[i];
if (common_i >= w[0].length)
{
this.cursor = c + w[0].length;
if (w.length < 4) return w[2];
var res = w[3](this);
this.cursor = c + w[0].length;
if (res) return w[2];
}
i = w[1];
} while (i >= 0);
return 0;
};
this.find_among_b = function(v)
{
var i = 0;
var j = v.length
var c = this.cursor;
var lb = this.limit_backward;
var common_i = 0;
var common_j = 0;
var first_key_inspected = false;
while (true)
{
var k = i + ((j - i) >> 1);
var diff = 0;
var common = common_i < common_j ? common_i : common_j;
var w = v[k];
var i2;
for (i2 = w[0].length - 1 - common; i2 >= 0; i2--)
{
if (c - common == lb)
{
diff = -1;
break;
}
diff = this.current.charCodeAt(c - 1 - common) - w[0].charCodeAt(i2);
if (diff != 0) break;
common++;
}
if (diff < 0)
{
j = k;
common_j = common;
}
else
{
i = k;
common_i = common;
}
if (j - i <= 1)
{
if (i > 0) break;
if (j == i) break;
if (first_key_inspected) break;
first_key_inspected = true;
}
}
do {
var w = v[i];
if (common_i >= w[0].length)
{
this.cursor = c - w[0].length;
if (w.length < 4) return w[2];
var res = w[3](this);
this.cursor = c - w[0].length;
if (res) return w[2];
}
i = w[1];
} while (i >= 0);
return 0;
};
this.replace_s = function(c_bra, c_ket, s)
{
var adjustment = s.length - (c_ket - c_bra);
this.current = this.current.slice(0, c_bra) + s + this.current.slice(c_ket);
this.limit += adjustment;
if (this.cursor >= c_ket) this.cursor += adjustment;
else if (this.cursor > c_bra) this.cursor = c_bra;
return adjustment;
};
this.slice_check = function()
{
if (this.bra < 0 ||
this.bra > this.ket ||
this.ket > this.limit ||
this.limit > this.current.length)
{
return false;
}
return true;
};
this.slice_from = function(s)
{
var result = false;
if (this.slice_check())
{
this.replace_s(this.bra, this.ket, s);
result = true;
}
return result;
};
this.slice_del = function()
{
return this.slice_from("");
};
this.insert = function(c_bra, c_ket, s)
{
var adjustment = this.replace_s(c_bra, c_ket, s);
if (c_bra <= this.bra) this.bra += adjustment;
if (c_bra <= this.ket) this.ket += adjustment;
};
this.slice_to = function()
{
var result = '';
if (this.slice_check())
{
result = this.current.slice(this.bra, this.ket);
}
return result;
};
this.assign_to = function()
{
return this.current.slice(0, this.limit);
};
};
EnglishStemmer = function() {
var base = new BaseStemmer();
 var a_0 = [
["arsen", -1, -1],
["commun", -1, -1],
["gener", -1, -1]
];
 var a_1 = [
["'", -1, 1],
["'s'", 0, 1],
["'s", -1, 1]
];
 var a_2 = [
["ied", -1, 2],
["s", -1, 3],
["ies", 1, 2],
["sses", 1, 1],
["ss", 1, -1],
["us", 1, -1]
];
 var a_3 = [
["", -1, 3],
["bb", 0, 2],
["dd", 0, 2],
["ff", 0, 2],
["gg", 0, 2],
["bl", 0, 1],
["mm", 0, 2],
["nn", 0, 2],
["pp", 0, 2],
["rr", 0, 2],
["at", 0, 1],
["tt", 0, 2],
["iz", 0, 1]
];
 var a_4 = [
["ed", -1, 2],
["eed", 0, 1],
["ing", -1, 2],
["edly", -1, 2],
["eedly", 3, 1],
["ingly", -1, 2]
];
 var a_5 = [
["anci", -1, 3],
["enci", -1, 2],
["ogi", -1, 13],
["li", -1, 15],
["bli", 3, 12],
["abli", 4, 4],
["alli", 3, 8],
["fulli", 3, 9],
["lessli", 3, 14],
["ousli", 3, 10],
["entli", 3, 5],
["aliti", -1, 8],
["biliti", -1, 12],
["iviti", -1, 11],
["tional", -1, 1],
["ational", 14, 7],
["alism", -1, 8],
["ation", -1, 7],
["ization", 17, 6],
["izer", -1, 6],
["ator", -1, 7],
["iveness", -1, 11],
["fulness", -1, 9],
["ousness", -1, 10]
];
 var a_6 = [
["icate", -1, 4],
["ative", -1, 6],
["alize", -1, 3],
["iciti", -1, 4],
["ical", -1, 4],
["tional", -1, 1],
["ational", 5, 2],
["ful", -1, 5],
["ness", -1, 5]
];
 var a_7 = [
["ic", -1, 1],
["ance", -1, 1],
["ence", -1, 1],
["able", -1, 1],
["ible", -1, 1],
["ate", -1, 1],
["ive", -1, 1],
["ize", -1, 1],
["iti", -1, 1],
["al", -1, 1],
["ism", -1, 1],
["ion", -1, 2],
["er", -1, 1],
["ous", -1, 1],
["ant", -1, 1],
["ent", -1, 1],
["ment", 15, 1],
["ement", 16, 1]
];
 var a_8 = [
["e", -1, 1],
["l", -1, 2]
];
 var a_9 = [
["succeed", -1, -1],
["proceed", -1, -1],
["exceed", -1, -1],
["canning", -1, -1],
["inning", -1, -1],
["earring", -1, -1],
["herring", -1, -1],
["outing", -1, -1]
];
 var a_10 = [
["andes", -1, -1],
["atlas", -1, -1],
["bias", -1, -1],
["cosmos", -1, -1],
["dying", -1, 3],
["early", -1, 9],
["gently", -1, 7],
["howe", -1, -1],
["idly", -1, 6],
["lying", -1, 4],
["news", -1, -1],
["only", -1, 10],
["singly", -1, 11],
["skies", -1, 2],
["skis", -1, 1],
["sky", -1, -1],
["tying", -1, 5],
["ugly", -1, 8]
];
 var  g_v = [17, 65, 16, 1];
 var  g_v_WXY = [1, 17, 65, 208, 1];
 var  g_valid_LI = [55, 141, 2];
var  B_Y_found = false;
var  I_p2 = 0;
var  I_p1 = 0;
function r_prelude() {
B_Y_found = false;
var  v_1 = base.cursor;
lab0: {
base.bra = base.cursor;
if (!(base.eq_s("'")))
{
break lab0;
}
base.ket = base.cursor;
if (!base.slice_del())
{
return false;
}
}
base.cursor = v_1;
var  v_2 = base.cursor;
lab1: {
base.bra = base.cursor;
if (!(base.eq_s("y")))
{
break lab1;
}
base.ket = base.cursor;
if (!base.slice_from("Y"))
{
return false;
}
B_Y_found = true;
}
base.cursor = v_2;
var  v_3 = base.cursor;
lab2: {
while(true)
{
var  v_4 = base.cursor;
lab3: {
golab4: while(true)
{
var  v_5 = base.cursor;
lab5: {
if (!(base.in_grouping(g_v, 97, 121)))
{
break lab5;
}
base.bra = base.cursor;
if (!(base.eq_s("y")))
{
break lab5;
}
base.ket = base.cursor;
base.cursor = v_5;
break golab4;
}
base.cursor = v_5;
if (base.cursor >= base.limit)
{
break lab3;
}
base.cursor++;
}
if (!base.slice_from("Y"))
{
return false;
}
B_Y_found = true;
continue;
}
base.cursor = v_4;
break;
}
}
base.cursor = v_3;
return true;
};
function r_mark_regions() {
I_p1 = base.limit;
I_p2 = base.limit;
var  v_1 = base.cursor;
lab0: {
lab1: {
var  v_2 = base.cursor;
lab2: {
if (base.find_among(a_0) == 0)
{
break lab2;
}
break lab1;
}
base.cursor = v_2;
golab3: while(true)
{
lab4: {
if (!(base.in_grouping(g_v, 97, 121)))
{
break lab4;
}
break golab3;
}
if (base.cursor >= base.limit)
{
break lab0;
}
base.cursor++;
}
golab5: while(true)
{
lab6: {
if (!(base.out_grouping(g_v, 97, 121)))
{
break lab6;
}
break golab5;
}
if (base.cursor >= base.limit)
{
break lab0;
}
base.cursor++;
}
}
I_p1 = base.cursor;
golab7: while(true)
{
lab8: {
if (!(base.in_grouping(g_v, 97, 121)))
{
break lab8;
}
break golab7;
}
if (base.cursor >= base.limit)
{
break lab0;
}
base.cursor++;
}
golab9: while(true)
{
lab10: {
if (!(base.out_grouping(g_v, 97, 121)))
{
break lab10;
}
break golab9;
}
if (base.cursor >= base.limit)
{
break lab0;
}
base.cursor++;
}
I_p2 = base.cursor;
}
base.cursor = v_1;
return true;
};
function r_shortv() {
lab0: {
var  v_1 = base.limit - base.cursor;
lab1: {
if (!(base.out_grouping_b(g_v_WXY, 89, 121)))
{
break lab1;
}
if (!(base.in_grouping_b(g_v, 97, 121)))
{
break lab1;
}
if (!(base.out_grouping_b(g_v, 97, 121)))
{
break lab1;
}
break lab0;
}
base.cursor = base.limit - v_1;
if (!(base.out_grouping_b(g_v, 97, 121)))
{
return false;
}
if (!(base.in_grouping_b(g_v, 97, 121)))
{
return false;
}
if (base.cursor > base.limit_backward)
{
return false;
}
}
return true;
};
function r_R1() {
if (!(I_p1 <= base.cursor))
{
return false;
}
return true;
};
function r_R2() {
if (!(I_p2 <= base.cursor))
{
return false;
}
return true;
};
function r_Step_1a() {
var  among_var;
var  v_1 = base.limit - base.cursor;
lab0: {
base.ket = base.cursor;
if (base.find_among_b(a_1) == 0)
{
base.cursor = base.limit - v_1;
break lab0;
}
base.bra = base.cursor;
if (!base.slice_del())
{
return false;
}
}
base.ket = base.cursor;
among_var = base.find_among_b(a_2);
if (among_var == 0)
{
return false;
}
base.bra = base.cursor;
switch (among_var) {
case 1:
if (!base.slice_from("ss"))
{
return false;
}
break;
case 2:
lab1: {
var  v_2 = base.limit - base.cursor;
lab2: {
{
var  c1 = base.cursor - 2;
if (base.limit_backward > c1 || c1 > base.limit)
{
break lab2;
}
base.cursor = c1;
}
if (!base.slice_from("i"))
{
return false;
}
break lab1;
}
base.cursor = base.limit - v_2;
if (!base.slice_from("ie"))
{
return false;
}
}
break;
case 3:
if (base.cursor <= base.limit_backward)
{
return false;
}
base.cursor--;
golab3: while(true)
{
lab4: {
if (!(base.in_grouping_b(g_v, 97, 121)))
{
break lab4;
}
break golab3;
}
if (base.cursor <= base.limit_backward)
{
return false;
}
base.cursor--;
}
if (!base.slice_del())
{
return false;
}
break;
}
return true;
};
function r_Step_1b() {
var  among_var;
base.ket = base.cursor;
among_var = base.find_among_b(a_4);
if (among_var == 0)
{
return false;
}
base.bra = base.cursor;
switch (among_var) {
case 1:
if (!r_R1())
{
return false;
}
if (!base.slice_from("ee"))
{
return false;
}
break;
case 2:
var  v_1 = base.limit - base.cursor;
golab0: while(true)
{
lab1: {
if (!(base.in_grouping_b(g_v, 97, 121)))
{
break lab1;
}
break golab0;
}
if (base.cursor <= base.limit_backward)
{
return false;
}
base.cursor--;
}
base.cursor = base.limit - v_1;
if (!base.slice_del())
{
return false;
}
var  v_3 = base.limit - base.cursor;
among_var = base.find_among_b(a_3);
if (among_var == 0)
{
return false;
}
base.cursor = base.limit - v_3;
switch (among_var) {
case 1:
{
var  c1 = base.cursor;
base.insert(base.cursor, base.cursor, "e");
base.cursor = c1;
}
break;
case 2:
base.ket = base.cursor;
if (base.cursor <= base.limit_backward)
{
return false;
}
base.cursor--;
base.bra = base.cursor;
if (!base.slice_del())
{
return false;
}
break;
case 3:
if (base.cursor != I_p1)
{
return false;
}
var  v_4 = base.limit - base.cursor;
if (!r_shortv())
{
return false;
}
base.cursor = base.limit - v_4;
{
var  c2 = base.cursor;
base.insert(base.cursor, base.cursor, "e");
base.cursor = c2;
}
break;
}
break;
}
return true;
};
function r_Step_1c() {
base.ket = base.cursor;
lab0: {
var  v_1 = base.limit - base.cursor;
lab1: {
if (!(base.eq_s_b("y")))
{
break lab1;
}
break lab0;
}
base.cursor = base.limit - v_1;
if (!(base.eq_s_b("Y")))
{
return false;
}
}
base.bra = base.cursor;
if (!(base.out_grouping_b(g_v, 97, 121)))
{
return false;
}
lab2: {
if (base.cursor > base.limit_backward)
{
break lab2;
}
return false;
}
if (!base.slice_from("i"))
{
return false;
}
return true;
};
function r_Step_2() {
var  among_var;
base.ket = base.cursor;
among_var = base.find_among_b(a_5);
if (among_var == 0)
{
return false;
}
base.bra = base.cursor;
if (!r_R1())
{
return false;
}
switch (among_var) {
case 1:
if (!base.slice_from("tion"))
{
return false;
}
break;
case 2:
if (!base.slice_from("ence"))
{
return false;
}
break;
case 3:
if (!base.slice_from("ance"))
{
return false;
}
break;
case 4:
if (!base.slice_from("able"))
{
return false;
}
break;
case 5:
if (!base.slice_from("ent"))
{
return false;
}
break;
case 6:
if (!base.slice_from("ize"))
{
return false;
}
break;
case 7:
if (!base.slice_from("ate"))
{
return false;
}
break;
case 8:
if (!base.slice_from("al"))
{
return false;
}
break;
case 9:
if (!base.slice_from("ful"))
{
return false;
}
break;
case 10:
if (!base.slice_from("ous"))
{
return false;
}
break;
case 11:
if (!base.slice_from("ive"))
{
return false;
}
break;
case 12:
if (!base.slice_from("ble"))
{
return false;
}
break;
case 13:
if (!(base.eq_s_b("l")))
{
return false;
}
if (!base.slice_from("og"))
{
return false;
}
break;
case 14:
if (!base.slice_from("less"))
{
return false;
}
break;
case 15:
if (!(base.in_grouping_b(g_valid_LI, 99, 116)))
{
return false;
}
if (!base.slice_del())
{
return false;
}
break;
}
return true;
};
function r_Step_3() {
var  among_var;
base.ket = base.cursor;
among_var = base.find_among_b(a_6);
if (among_var == 0)
{
return false;
}
base.bra = base.cursor;
if (!r_R1())
{
return false;
}
switch (among_var) {
case 1:
if (!base.slice_from("tion"))
{
return false;
}
break;
case 2:
if (!base.slice_from("ate"))
{
return false;
}
break;
case 3:
if (!base.slice_from("al"))
{
return false;
}
break;
case 4:
if (!base.slice_from("ic"))
{
return false;
}
break;
case 5:
if (!base.slice_del())
{
return false;
}
break;
case 6:
if (!r_R2())
{
return false;
}
if (!base.slice_del())
{
return false;
}
break;
}
return true;
};
function r_Step_4() {
var  among_var;
base.ket = base.cursor;
among_var = base.find_among_b(a_7);
if (among_var == 0)
{
return false;
}
base.bra = base.cursor;
if (!r_R2())
{
return false;
}
switch (among_var) {
case 1:
if (!base.slice_del())
{
return false;
}
break;
case 2:
lab0: {
var  v_1 = base.limit - base.cursor;
lab1: {
if (!(base.eq_s_b("s")))
{
break lab1;
}
break lab0;
}
base.cursor = base.limit - v_1;
if (!(base.eq_s_b("t")))
{
return false;
}
}
if (!base.slice_del())
{
return false;
}
break;
}
return true;
};
function r_Step_5() {
var  among_var;
base.ket = base.cursor;
among_var = base.find_among_b(a_8);
if (among_var == 0)
{
return false;
}
base.bra = base.cursor;
switch (among_var) {
case 1:
lab0: {
var  v_1 = base.limit - base.cursor;
lab1: {
if (!r_R2())
{
break lab1;
}
break lab0;
}
base.cursor = base.limit - v_1;
if (!r_R1())
{
return false;
}
{
var  v_2 = base.limit - base.cursor;
lab2: {
if (!r_shortv())
{
break lab2;
}
return false;
}
base.cursor = base.limit - v_2;
}
}
if (!base.slice_del())
{
return false;
}
break;
case 2:
if (!r_R2())
{
return false;
}
if (!(base.eq_s_b("l")))
{
return false;
}
if (!base.slice_del())
{
return false;
}
break;
}
return true;
};
function r_exception2() {
base.ket = base.cursor;
if (base.find_among_b(a_9) == 0)
{
return false;
}
base.bra = base.cursor;
if (base.cursor > base.limit_backward)
{
return false;
}
return true;
};
function r_exception1() {
var  among_var;
base.bra = base.cursor;
among_var = base.find_among(a_10);
if (among_var == 0)
{
return false;
}
base.ket = base.cursor;
if (base.cursor < base.limit)
{
return false;
}
switch (among_var) {
case 1:
if (!base.slice_from("ski"))
{
return false;
}
break;
case 2:
if (!base.slice_from("sky"))
{
return false;
}
break;
case 3:
if (!base.slice_from("die"))
{
return false;
}
break;
case 4:
if (!base.slice_from("lie"))
{
return false;
}
break;
case 5:
if (!base.slice_from("tie"))
{
return false;
}
break;
case 6:
if (!base.slice_from("idl"))
{
return false;
}
break;
case 7:
if (!base.slice_from("gentl"))
{
return false;
}
break;
case 8:
if (!base.slice_from("ugli"))
{
return false;
}
break;
case 9:
if (!base.slice_from("earli"))
{
return false;
}
break;
case 10:
if (!base.slice_from("onli"))
{
return false;
}
break;
case 11:
if (!base.slice_from("singl"))
{
return false;
}
break;
}
return true;
};
function r_postlude() {
if (!B_Y_found)
{
return false;
}
while(true)
{
var  v_1 = base.cursor;
lab0: {
golab1: while(true)
{
var  v_2 = base.cursor;
lab2: {
base.bra = base.cursor;
if (!(base.eq_s("Y")))
{
break lab2;
}
base.ket = base.cursor;
base.cursor = v_2;
break golab1;
}
base.cursor = v_2;
if (base.cursor >= base.limit)
{
break lab0;
}
base.cursor++;
}
if (!base.slice_from("y"))
{
return false;
}
continue;
}
base.cursor = v_1;
break;
}
return true;
};
this.stem =  function() {
lab0: {
var  v_1 = base.cursor;
lab1: {
if (!r_exception1())
{
break lab1;
}
break lab0;
}
base.cursor = v_1;
lab2: {
{
var  v_2 = base.cursor;
lab3: {
{
var  c1 = base.cursor + 3;
if (0 > c1 || c1 > base.limit)
{
break lab3;
}
base.cursor = c1;
}
break lab2;
}
base.cursor = v_2;
}
break lab0;
}
base.cursor = v_1;
r_prelude();
r_mark_regions();
base.limit_backward = base.cursor; base.cursor = base.limit;
var  v_5 = base.limit - base.cursor;
r_Step_1a();
base.cursor = base.limit - v_5;
lab4: {
var  v_6 = base.limit - base.cursor;
lab5: {
if (!r_exception2())
{
break lab5;
}
break lab4;
}
base.cursor = base.limit - v_6;
var  v_7 = base.limit - base.cursor;
r_Step_1b();
base.cursor = base.limit - v_7;
var  v_8 = base.limit - base.cursor;
r_Step_1c();
base.cursor = base.limit - v_8;
var  v_9 = base.limit - base.cursor;
r_Step_2();
base.cursor = base.limit - v_9;
var  v_10 = base.limit - base.cursor;
r_Step_3();
base.cursor = base.limit - v_10;
var  v_11 = base.limit - base.cursor;
r_Step_4();
base.cursor = base.limit - v_11;
var  v_12 = base.limit - base.cursor;
r_Step_5();
base.cursor = base.limit - v_12;
}
base.cursor = base.limit_backward;
var  v_13 = base.cursor;
r_postlude();
base.cursor = v_13;
}
return true;
};
this['stemWord'] = function(word) {
base.setCurrent(word);
this.stem();
return base.getCurrent();
};
};
return new EnglishStemmer();
}
wh.search_stemmer = Snowball();
wh.search_baseNameList = [
 "appendices.html",
 "appendix.dictionaries.html",
 "appendix.glossaries.html",
 "appendix.regexp.html",
 "appendix.segmentation.html",
 "appendix.shortcut.custom.html",
 "appendix.shortcut.html",
 "appendix.spellchecker.html",
 "application.folder.html",
 "chapter.installing.and.running.html",
 "chapter.instant.start.guide.html",
 "configuration.folder.html",
 "dialogs.preferences.html",
 "how.to.html",
 "index.html",
 "installing.and.running.omegat.html",
 "installing.omegat.html",
 "menus.html",
 "panes.html",
 "project.folder.html",
 "running.omegat.html",
 "spellchecker.html",
 "troubleshooting.html",
 "windows.and.dialogs.html"
];
wh.search_titleList = [
 "Appendices",
 "Appendix D. Dictionaries",
 "Appendix C. Glossaries",
 "Appendix B. Regular expressions",
 "Appendix A. Segmentation",
 "Appendix E. Shortcuts description",
 "Appendix F. OmegaT shortcuts",
 "Appendix C. Spell checker",
 "Application Folder",
 "Installing and running OmegaT",
 "Introduction to OmegaT",
 "Configuration Folder",
 "Preferences",
 "How To...",
 "OmegaT 5.8.0 - User Guide DRAFT",
 "Installing and Running OmegaT 5.8.0",
 "Install OmegaT",
 "Menus",
 "Panes",
 "Project Folder",
 "Run OmegaT",
 "Appendix E. Spell checker",
 "Troubleshooting",
 "Windows and Dialogs"
];
wh.search_wordMap= {
"cancel": [0,3,[17,23]],
"altgraph": [0,[5,6]],
"stats-typ": [[13,20]],
"half": [12],
"don\'t": [9,19],
"upload": [13,17],
"your": [13,9,10,0,23,12,15,[7,17,18,21],[14,20],2,19,[5,11],[6,16],3,1,4],
"elimin": [13],
"without": [13,23,15,[0,9,12,16,20],19,[2,3,4,6,18]],
"these": [19,[0,9],[7,13,21],[6,10,11,12,15,16,20,23]],
"would": [9,[0,19],[3,12,13,20,23]],
"xml": [12,[13,20]],
"ten": [23,[13,17]],
"sake": [[2,13,20]],
"beginn": [10],
"info.plist": [[13,15],20,[9,16]],
"i.e": [[7,9,21],[1,12]],
"xmx": [9],
"sometim": [12,13],
"thus": [[6,9,10,12]],
"noun": [18],
"scratch": [13],
"castillian": [[7,21]],
"click": [23,12,9,15,17,[13,18],20,[0,7,10,21],[4,16]],
"insensit": [0,[3,23]],
"fuzzi": [12,17,18,23,[0,13],19,[10,14]],
"befor": [13,[0,12],3,15,[17,23],[4,9,20],[10,16,19],[2,7,18,21]],
"util": [13,[9,20]],
"size": [12,23,[13,20]],
"left": [0,6,18,[13,17],[4,9,12,23]],
"seri": [[0,3]],
"tar.bz": [1,19],
"much": [[0,7,12,13,21]],
"object": [23,[0,4,13,15,16]],
"besid": [[7,9,21]],
"chapter": [13],
"ahead": [[0,3]],
"yellow": [17],
"turn": [0,3,[13,17,19,23]],
"suffici": [[9,12,13]],
"dgoogle.api.key": [9],
"result": [23,13,[0,12,17,20],[9,14,18],[3,10]],
"edittagnextmissedmenuitem": [[0,5,6]],
"same": [[12,13,23],9,0,[15,18,20],[3,10,16,17],[1,4,7,19,21]],
"editorskipprevtoken": [[0,6]],
"checkbox": [[9,23]],
"after": [0,13,4,[12,23],10,[3,9,18],[2,15,17],[6,16],[5,19,20]],
"quiet": [9,[13,20]],
"flip": [0],
"connect": [[12,13],[7,15,16,18,21]],
"hand": [[10,23]],
"address": [[0,9],[13,20],[12,18,19]],
"es_es.d": [[7,21]],
"tradit": [9],
"union": [13],
"assembledist": [[9,15]],
"statmt.org": [12],
"gnu": [13],
"the": [13,23,0,12,9,17,18,19,15,20,3,10,2,16,21,7,5,[4,11],6,1,14],
"straight": [0],
"wipe": [10],
"blue": [23,18],
"projectimportmenuitem": [[0,5,6]],
"imag": [[0,9,15]],
"target.txt": [[0,11,12]],
"monolingu": [12,23],
"goe": [23],
"demonstr": [0],
"temurin": [[13,15,16]],
"discuss": [5],
"standard": [10,13,[7,12,15,16,21,23],[0,2,9,17,18,20]],
"correct": [23,[7,9,13,21],[2,12,18],[0,1,14,15,17,19,20]],
"traduct": [18],
"project-bas": [23],
"advic": [13,[9,15,20]],
"good": [[10,13],[12,14]],
"deploy": [9],
"wish": [9,23,[7,13,15,16,19,21]],
"nameon": [12],
"moodlephp": [[9,13,20]],
"currsegment.getsrctext": [23],
"optionsglossarytbxdisplaycontextcheckboxmenuitem": [[5,6]],
"implement": [9,12],
"alphanumer": [0],
"uncheck": [23,12,0,4],
"export": [0,[17,23],[11,13,19],[5,6,10,12,14]],
"gotonextnotemenuitem": [[0,5,6]],
"area": [18,23],
"tar.gz": [9],
"practic": [[3,23],[0,9,13,19]],
"gpl": [0,1],
"european": [13],
"newentri": [23],
"pay": [9],
"reduc": [23],
"check": [12,23,17,[7,21],13,0,10,9,4,[1,2],[3,5,6,15,16,18,19]],
"transtip": [[5,6]],
"list": [0,12,13,23,17,[4,20],14,[6,7,10,11,18,21],[2,5,9,15,16,19]],
"onto": [9,[13,15,16]],
"autocompleterprevview": [[0,6]],
"xxxx9xxxx9xxxxxxxx9xxx99xxxxx9xx9xxxxxxxxxx": [9],
"resolut": [10],
"vowel": [[0,3]],
"azur": [9],
"fr-fr": [[7,12,21]],
"ensur": [13,[9,10,12,23]],
"minim": [[12,13,17,18,20]],
"locali": [13],
"primari": [9],
"projectcommittargetfil": [0],
"pear": [0],
"determin": [[12,23],[0,3,7,21]],
"root": [[5,6,9,13]],
"combin": [0,3,[9,12,23],[1,5,6,13,19,20]],
"webster": [1],
"po4a": [13],
"japonai": [23],
"omegat.org": [[13,15,16]],
"menus": [9,[0,5,6,15,23],[17,18],[10,12,13,14,20]],
"hard": [[9,13]],
"realign": [23],
"object-ori": [23],
"cjk": [23,[0,3]],
"perform": [13,[20,23],10,[0,9,12,15,16]],
"prewritten": [19],
"alternatives—th": [18],
"maxprogram": [13],
"better": [23,0,10],
"with": [0,13,23,9,12,17,20,15,[10,18],19,6,[4,16],5,3,[1,2,7,14,21],11],
"pdf": [13,17,[0,23]],
"there": [13,9,23,0,[7,15,17,20,21],[2,3,10,16,18],[1,6,12,19]],
"syntax": [0,20,[5,6,13],12,[14,23]],
"well": [0,13,23,[3,4,9,10,15],[12,17,20],16],
"empti": [13,19,[0,17],[12,18],[4,5,6,9,10,23],[2,3,20]],
"autocompletertabledown": [[0,6]],
"editornextsegmentnottab": [[0,6]],
"toolsshowstatisticsmatchesmenuitem": [[0,5,6]],
"channel": [[0,3]],
"focus": [10,[0,13]],
"viewdisplaymodificationinfononeradiobuttonmenuitem": [[0,5,6]],
"desir": [13,20,[9,23],[12,15],[0,2]],
"approach": [13],
"upper-cas": [3],
"variabl": [12,14],
"block": [23,0,[3,17],[10,12,14]],
"tms": [13,14,19,[0,17,23],10],
"per": [19,5,[0,6,9,12,17,18,23]],
"write": [[13,23],18,[12,14],[0,9,17,20]],
"tmx": [13,23,19,20,9,[10,12,17,18]],
"propos": [23],
"order": [12,[0,23],18,[3,4,17,19]],
"e.g": [12,9,[7,13,15,16,21,23]],
"project_save.tmx.bak": [[13,19]],
"cli": [[13,20]],
"repo_for_all_omegat_team_project": [13],
"period": [0,3,4,12,[9,13,20]],
"colleagu": [18],
"application_startup": [23],
"proceed": [13,[1,23]],
"eventtyp": [23],
"byte": [[13,20]],
"understand": [[12,13]],
"integ": [12],
"intel": [9],
"fr-ca": [12],
"mainmenushortcuts.properti": [0,[5,6],11],
"ever": [[10,12]],
"projectaccesswriteableglossarymenuitem": [[0,5,6]],
"even": [[13,23],12,0,[10,17,20],[3,9,18,19]],
"aris": [13],
"application_shutdown": [23],
"autocompletertablelastinrow": [[0,6]],
"gui": [13,20,[9,23],19],
"proport": [12],
"regexp": [9,[0,3]],
"subtitl": [[9,13,20]],
"sentencecasemenuitem": [[0,5,6]],
"gotohistorybackmenuitem": [[0,5,6]],
"save": [17,23,13,12,19,0,[2,5,6,9,20],15,[10,14,18]],
"v1.0": [13],
"matter": [9],
"articl": [0],
"undescor": [3],
"instant": [9],
"relaunch": [[5,6],19],
"goto": [5,[0,6,14]],
"editorcontextmenu": [[0,6]],
"top": [12,[18,23],[10,13,17]],
"too": [13,[7,12,21]],
"have": [13,[0,12,23],9,10,17,[15,16],19,18,3,[2,5,7,21],6,[1,4],[11,20]],
"powerpc": [9,[13,15,16]],
"optionssentsegmenuitem": [[0,5,6]],
"slowli": [[9,13,15,20]],
"mandatori": [12],
"avail": [23,13,[9,12],20,15,[5,17],[6,7,16,18,21],0,[3,10]],
"product": [[0,3,13]],
"robust": [[10,13]],
"question": [0,3],
"bought": [0],
"hyphen": [0,3],
"optionsaccessconfigdirmenuitem": [[0,5,6]],
"charact": [0,3,23,12,17,18,9,2,[4,5,6,10,13,14,20],11],
"framework": [13],
"test.html": [[9,13,20]],
"php": [12],
"xxx": [19],
"instanc": [0,[3,9],13,[7,20,21,23],[1,15,17]],
"thousand": [0],
"smalltalk": [23],
"com": [[0,3]],
"instal": [9,15,13,16,[7,12,21],[0,11],1,[10,17,20],[14,18]],
"minor": [19],
"arrow": [23,[0,18]],
"almost": [[5,6,17]],
"profject": [19],
"cot": [0],
"remot": [13,19,[9,15,17,18,20,23]],
"manner": [10],
"upon": [[0,7,10,18,21,23]],
"whenev": [[10,13,19]],
"lag": [13],
"earlier": [0],
"omegat.sourceforge.io": [9],
"pseudotranslatetmx": [[9,13,20]],
"whether": [12,9,23,[13,18,19,20]],
"unabl": [[12,18]],
"function": [0,6,17,12,[13,23],[3,5,7,10,21],[11,18,19],[2,14,20]],
"pipe": [[0,3]],
"start-up": [9,[13,15,20]],
"quantifi": [3],
"comparison": [23],
"targetlanguagecod": [12],
"platform-specif": [12],
"undock": [18,12],
"tri": [23,[12,13],[0,3,9]],
"editorprevsegmentnottab": [[0,6]],
"revert": [9],
"tick": [[4,7,21]],
"less": [13,9],
"changeid": [12],
"absolut": [12],
"translat": [13,12,23,10,18,17,0,19,9,4,14,[5,6],20,[3,7,21],[2,11]],
"uniqu": [23,[17,18],[0,5,6]],
"eras": [12],
"welcom": [10],
"bidirect": [[13,17],[0,5,6]],
"were": [[10,13],18],
"basic": [13,[3,9,23],0],
"disabl": [23,[3,12],17,[2,13,20]],
"footer": [12],
"cqt": [0],
"shorthand": [0],
"respons": [18],
"docs_devel": [[9,13,15,16]],
"lck": [18],
"twelv": [0,3],
"tsv": [[0,2]],
"extra": [9,[0,3,13,17,18]],
"design": [10],
"command-lin": [[9,13]],
"unpack": [9,[13,15,16],1],
"writeabl": [[5,6]],
"semicolon": [13],
"gnome": [9,15],
"encourag": [13],
"accord": [[12,23]],
"horizont": [3,0],
"doctor": [0],
"encyclopedia": [1],
"conduct": [23],
"mqxliff": [13],
"omegat.project.yyyymmddhhmm.bak": [13],
"appdata": [[0,11]],
"optionstagvalidationmenuitem": [[5,6]],
"gotten": [0],
"configdir": [13],
"prev": [[0,1,2,3,4,5,6,7,8,9,10,11,12,13,15,16,17,18,19,20,21,22,23]],
"csv": [[0,2],[9,13,20]],
"n.n_linux.tar.bz2": [9],
"pt_br": [[7,21],9],
"installdist": [[13,16]],
"a-z": [[0,3]],
"concern": [3],
"enhanc": [17],
"password": [13,12,[15,16]],
"ambigu": [12],
"let": [23,[0,12,18]],
"state": [[0,13,23],[10,11,12,19]],
"editordeleteprevtoken": [[0,6]],
"press": [23,0,17,[5,6,18],[9,12,13,15]],
"eventu": [13,[7,10,16,21]],
"dock": [9,15,13,[16,20]],
"onlin": [[7,21,23],[0,3,10,13,17]],
"coffe": [0],
"element": [12,23,10],
"caret": [0,3],
"want": [23,13,0,[12,17],[3,15,19],[2,10,16],[5,20],[6,7,21]],
"night": [[13,15,16]],
"dmicrosoft.api.client_secret": [9],
"processor": [23,10],
"each": [0,23,[12,13,17],11,[4,10],[2,3,18,19,20]],
"javascript": [23],
"mediawiki": [[17,23],[0,5,6,10]],
"input": [[13,17],12],
"toolkit": [13],
"creativ": [[0,4]],
"must": [13,[0,9],5,[3,7,12,20,21],6,[2,19],11],
"join.html": [0],
"suppli": [12],
"non-omegat": [12],
"installdictionari": [19],
"cur": [[0,3]],
"filenameon": [12],
"cut": [[0,12,18]],
"ctrl": [0,6,5,[2,17]],
"editorinsertlinebreak": [[0,6]],
"jumptoentryineditor": [[0,6]],
"document": [13,[0,23],12,5,4,[6,10],2,[17,18],[3,9,14,15],[16,19,20]],
"omegat.kaptn": [[13,15,20]],
"mainten": [13],
"two": [13,[9,23],0,[3,7,14,21],[12,15,16,17],[10,19]],
"accident": [12],
"user-defin": [23],
"anyway": [9],
"moment": [13],
"pop": [[0,17]],
"page_up": [[0,6]],
"found": [23,17,9,[12,13],[0,18],[2,3,10,15,16]],
"usernam": [13],
"scenario": [13],
"encrypt": [[0,11]],
"larg": [23,[0,7,13,21]],
"attach": [23,[1,2,12]],
"anoth": [13,[3,9,20],[0,15,17,23]],
"freez": [13],
"advantag": [[0,9]],
"graphic": [13,20,9],
"creation": [17,[10,12,19]],
"resourc": [10,23,19,9,[13,20],[0,12,15]],
"latest": [19,9],
"pend": [23],
"moodl": [12],
"team": [13,17,[0,19],[10,12,14,20,23],[5,6,11],[9,15,16,18]],
"xx_yy": [12],
"side-by-sid": [[9,13,15,16]],
"docx": [13,23,[12,17]],
"project_stats_match_per_file.txt": [19],
"diagram": [12],
"txt": [13,[0,2],[18,20]],
"charg": [9],
"googl": [9,12],
"rules-bas": [4],
"quit": [17,[5,6],[0,12]],
"re-ent": [12],
"thing": [[10,13]],
"chart": [12],
"download.html": [9],
"fashion": [10],
"definit": [0,6,5,[3,12]],
"won\'t": [13,14],
"lib": [0],
"viewmarkfontfallbackcheckboxmenuitem": [0],
"tedious": [0],
"had": [0,[10,23]],
"prepar": [[0,13],[2,14]],
"align": [23,[13,17],20,[9,10],[0,12,14]],
"adjac": [18],
"insertcharsrlm": [0],
"endnot": [12],
"sourceforg": [[5,13],[0,6,9,15,16]],
"trnsl": [9],
"structur": [23,[0,4,13,19],[10,12]],
"goodi": [9],
"han": [[0,3]],
"viewdisplaymodificationinfoselectedradiobuttonmenuitem": [[0,5,6]],
"entir": [[0,17],[13,18]],
"index.html": [0,[9,13,15,16]],
"semeru-runtim": [[13,15,16]],
"has": [[0,13],23,[12,17],[3,9],[2,7,18,19,21]],
"keyword": [23,10],
"given": [9,13,[12,19],[0,1,3,15,16,23]],
"doubl": [[0,9],[3,13,15,16]],
"actual": [[0,9,10]],
"unlock": [18,0],
"autosav": [18],
"last": [17,0,6,23,[5,12,18],13,[3,9,10,19,20]],
"editmultipledefault": [[0,5,6]],
"adapt": [23,12],
"batch": [9],
"mozilla": [[9,12,13,20]],
"doubt": [[19,23]],
"editfindinprojectmenuitem": [[0,5,6]],
"develop": [13,15,[12,16,23],[0,6,14]],
"pro": [12],
"reproduc": [[12,23]],
"diffrevers": [12],
"warn": [23,13,12,[9,10],[0,20],[17,19],[3,4,11]],
"bookmark": [12],
"attent": [9],
"easiest": [[0,12,13]],
"technetwork": [9],
"inlin": [23],
"page": [0,6,[17,23],[5,9,13],10],
"full": [23,[12,13],[0,5,9,15,16,18,20]],
"plural": [12],
"away": [[12,13]],
"becaus": [[0,12],20],
"concept": [20],
"white-spac": [3],
"three-column": [[0,2]],
"parenthesi": [0,3],
"project.gettranslationinfo": [23],
"czt": [0],
"precis": [13],
"overview": [20,13],
"yes": [9,23],
"duckduckgo.com": [12],
"start": [9,0,23,[4,13],[3,10,12,15],20,[5,6,11,17]],
"yet": [[10,12,17],[3,13,19,23]],
"mymemori": [12],
"stylist": [[0,3]],
"pair": [0,[13,23],12],
"regex101": [[0,3]],
"generic": [12,15,[13,20]],
"equal": [[0,9],[12,13,17,18,20]],
"wiser": [[7,21]],
"colour": [[0,23],[5,6,12]],
"n.n_windows.ex": [9],
"chang": [23,12,[9,13],19,0,15,17,20,[2,18],[5,6,16],[4,7,10,21]],
"watson": [12],
"anywher": [[18,19],[0,9,23]],
"short": [23,[0,7,10,12,13,21]],
"pop-up": [18],
"time": [0,13,23,[10,19],17,[11,12],[4,7,18,21],[2,9,15,16]],
"optionsalwaysconfirmquitcheckboxmenuitem": [[5,6]],
"tmxs": [[5,6,12,17]],
"kanji": [0],
"program": [9,[13,20],[0,15],[10,11,23],[12,16,18]],
"three": [0,13,[1,11,18,19],[3,10,12,17,23]],
"cyan": [17],
"put": [13,[0,12,19],[3,5,6,10,23]],
"project_save.tmx.yyyymmddhhmm.bak": [13],
"viewmarkglossarymatchescheckboxmenuitem": [0],
"her": [0],
"enter": [0,23,17,6,12,13,[9,18],[10,15],[5,11],[3,4,16]],
"prioriti": [[12,17],[10,13,20]],
"tran": [12],
"pale": [17],
"applic": [13,17,[0,9],20,15,23,16,[7,12,21],[2,8,10,19],[3,11,14]],
"bidi": [23],
"projectteamnewmenuitem": [[0,5,6]],
"russian": [9],
"iraq": [0],
"dossier": [18],
"preced": [0,3,23],
"right-click": [[9,15,23],[17,18,20],[2,7,13,19,21]],
"directorate-gener": [17],
"non-seg": [12],
"brunt": [0],
"memori": [13,[10,23],19,9,[0,18,20],[4,15,17],12,14],
"autocompletertablelast": [[0,6]],
"submenu": [[9,15]],
"n.n_mac.zip": [9],
"authent": [13,12,18],
"light": [12],
"no-match": [17],
"retransl": [13],
"indefinit": [0],
"recogn": [0,[2,23],[18,19],[10,12,13,17]],
"tabl": [0,6,5,[3,12],14,[2,4,13,17,18]],
"engin": [18,[12,17],23],
"post-process": [23,12],
"interval—in": [12],
"log": [0,11,17,[5,6,9]],
"four-step": [23],
"smart": [13],
"lot": [0,[3,13,14,23]],
"doc-license.txt": [0],
"永住権": [[12,23]],
"openjdk": [[13,15,16]],
"omegat.jnlp": [9],
"everytim": [[12,13,19]],
"consult": [[0,13],[3,15,20]],
"theme": [12,23],
"toolscheckissuesmenuitem": [0],
"pane": [18,23,17,12,10,19,13,2,0,14],
"undesir": [17],
"n.n_windows_without_jre.ex": [9],
"meant": [19],
"editor": [23,0,12,18,17,[14,19],[6,10,13],[2,9],[11,15,20]],
"pseudotranslatetyp": [9,[13,20]],
"tutori": [0],
"orphan": [23],
"cycl": [17,[0,5,6]],
"autocompletertablepageup": [[0,6]],
"fetch": [17,12,0],
"dmicrosoft.api.client_id": [9],
"www.deepl.com": [12],
"char": [23],
"small": [[0,17]],
"config-fil": [9,[13,20]],
"quick": [0,23,13,9],
"tell": [9,13,[0,3,10,15,16,23]],
"projectclosemenuitem": [0,[5,6]],
"unavail": [[9,12]],
"checker": [[7,21],12,[0,1,6,17]],
"viewmarknonuniquesegmentscheckboxmenuitem": [[0,5,6]],
"hit": [23,[9,15,17]],
"major": [0,[3,11,13,20]],
"shown": [18,[17,23],12,[0,2,13,20]],
"titl": [17,[0,5,6,23]],
"consider": [[13,15,16]],
"inspir": [23],
"day": [13,0,10],
"lre": [[0,17]],
"group": [0,3,12,[18,23],[10,13]],
"obtain": [9,[1,10,12,13,23]],
"suppos": [0],
"findinprojectreuselastwindow": [[0,5,6]],
"system-user-nam": [12],
"lrm": [[0,17]],
"liter": [12],
"format": [13,0,[10,12],2,23,17,19,[4,14,18],[1,20],[9,15]],
"tree": [19],
"particular": [[7,9,13,20,21,23]],
"readme.txt": [13,[0,12,15,16]],
"done": [13,[9,10,15,16,18]],
"languagetool": [17,12,[14,23]],
"console.println": [23],
"rainbow": [13],
"twice": [0],
"source.txt": [[0,11,12]],
"files.s": [23],
"autocompleterlistdown": [[0,6]],
"histori": [[0,17],12,[5,6]],
"exchang": [[0,2]],
"auto-sync": [23],
"achiev": [[9,13]],
"launcher": [9,15,[13,20]],
"request": [9,[13,17],[15,20]],
"procedur": [13,[5,7,15,16,21]],
"pars": [[0,4,18,23]],
"part": [12,[0,23],[3,17],[10,13,19],[7,9,11,21]],
"currseg": [23],
"their": [23,13,0,12,10,[2,3,4,6,9,17,18,19,20]],
"generat": [19,13,[0,10,11,12,15,16,17]],
"unexpect": [13],
"point": [12,0,13,3],
"general": [[12,23],13,0,3,[18,20],15,[4,5,6,14,16]],
"browser": [12,[9,17,18]],
"activefilenam": [23],
"easi": [10,[13,20]],
"process": [0,9,[12,13],[10,23],[4,17],[5,6,11,14,15,16,20]],
"project_files_show_on_load": [[0,11],23],
"autocompletertrigg": [[0,6]],
"instance—a": [18],
"attribut": [12,[0,4]],
"clear": [[17,23]],
"ltr": [13,[0,6,14]],
"apostroph": [0],
"optionsexttmxmenuitem": [[5,6]],
"downloaded_file.tar.gz": [9],
"third": [13,[18,19],[0,2,10,14]],
"acquiert": [12],
"build": [[9,13,15,16],3,[14,23]],
"mean": [0,3,23,[5,12,13,18]],
"neither": [[0,3]],
"further": [10,19,[0,4,12,18,23]],
"account": [13,9,[6,12,17,19,23],5],
"marketplac": [9],
"snippet": [23],
"been": [13,17,23,9,[10,12],[0,2,5,6,15,16,19]],
"recov": [11],
"stack": [23],
"dhttp.proxyhost": [9,[13,20]],
"japanes": [[12,13],[0,4,9,15,20]],
"ident": [23,[17,19],[0,5,6,9,12,13,18]],
"entries.s": [23],
"addit": [0,[12,23],[9,11],[1,3,10,13,14,17]],
"alphabet": [0,3,[18,23]],
"simplifi": [20,13],
"gotonextuntranslatedmenuitem": [[0,5,6]],
"subdirectori": [13],
"targetlocal": [12],
"systemwid": [[13,15,16]],
"editorprevseg": [[0,6]],
"path": [13,9,20,[12,15],[16,18,23]],
"trip": [13],
"bind": [23],
"abbrevi": [[0,3]],
"overwritten": [13,[10,15,16],12,[9,23]],
"record": [0,[2,11,19]],
"monospac": [12],
"a-za-z0": [[0,3]],
"prece": [3],
"strict": [13],
"you": [13,23,0,9,12,10,[15,19],[16,17,18],2,20,3,[7,21],[5,11],6,4,1,14],
"jump": [[0,18,23],[6,17]],
"reinsert": [10],
"happen": [13,11],
"www.apertium.org": [12],
"pass": [[9,13]],
"allsegments.tmx": [9],
"past": [17,[13,15,16,18]],
"impact": [12,10],
"mainstream": [[0,6]],
"percentag": [18,12,19],
"especi": [[13,15,16,23]],
"cours": [[7,21],[9,10,19,23]],
"whose": [17],
"project_save.tmx.tmp": [13],
"configur": [13,[0,12],11,15,[16,20],[6,9,17],5,[18,23],14],
"nativ": [13,[0,3,12]],
"helpcontentsmenuitem": [[0,5,6]],
"finer": [3],
"domain": [2],
"resnam": [12],
"omegat-org": [13],
"descript": [5,6,[0,12,23],[9,10,14,15,17]],
"remote-project": [[13,20]],
"preserv": [12,13],
"initialcreationid": [12],
"ignore.txt": [19],
"organ": [[0,2]],
"mega": [0],
"projectaccessdictionarymenuitem": [[0,5,6]],
"customiz": [[5,6]],
"sentenc": [0,4,[10,23],12,[3,5,6,13,14,17]],
"alongsid": [15,[13,16]],
"optionsworkflowmenuitem": [[0,5,6]],
"consecut": [23,0],
"dgt": [13],
"how": [[0,10,12,13],18,22,[6,14,15,23]],
"releas": [13,[0,5,6,17]],
"memor": [3],
"term": [2,23,18,0,17,12,10,19,[5,6]],
"backslash": [0,3,[9,13,20]],
"sparc": [9],
"files_order.txt": [19],
"mind": [[0,3,13,15,16]],
"projectrestartmenuitem": [[0,5,6]],
"editorskipnexttoken": [[0,6]],
"trans-unit": [12],
"right": [0,23,6,[13,18],9,17,[4,12,15,19]],
"insid": [[13,15],20,[0,9,16]],
"qigong": [0],
"stage": [13,23],
"keybind": [23],
"maximum": [12,[0,3,13,20,23]],
"under": [9,13,[12,17,23],[1,15,18,19,20]],
"spotlight": [9],
"xhmtl": [12],
"submenus": [[13,20,23]],
"did": [23],
"represent": [23],
"imper": [23],
"reserv": [[7,9,13,15,20,21]],
"dir": [[9,13,20]],
"down": [0,6,23,12],
"hold": [23,10,18],
"linebreak": [[0,3,6]],
"trail": [12],
"subdir": [13],
"later": [13,0,[9,15,16,19],[18,20,23]],
"legal": [[0,4]],
"bracket": [0,3],
"forgotten": [1],
"unrespons": [23],
"viewfilelistmenuitem": [[0,5,6]],
"info": [[0,5,6],[9,17,18]],
"brows": [15,[9,23],18],
"hyperlink": [18],
"autocompletertableleft": [[0,6]],
"non-break": [23,[0,17],[3,5,6,12]],
"journey": [0],
"test": [13,[9,20],[0,15,16]],
"count": [17,12],
"omegat": [13,9,15,0,12,16,23,10,20,17,19,5,[6,14],11,3,18,21,7,[2,4],1],
"forward-backward": [23],
"allemand": [12,23],
"deepl": [12],
"take": [0,23,13,[7,10,12,17,21],[3,4,5,6]],
"month": [[0,13],[9,10]],
"thereof": [[0,2,11]],
"final": [0,10,[9,13,15,19]],
"editorlastseg": [[0,6]],
"file-source-encod": [12],
"occasion": [0],
"some": [13,12,0,[9,18,19],[10,11,17,20,23],[1,2,4,7,21]],
"virtual": [23,[13,20]],
"blank": [12],
"rather": [0,23,[3,7,9,13,21]],
"session": [[0,9,13,15,18,20,23]],
"console-align": [9,[13,20,23]],
"back": [23,[0,13,18],10,[11,17],[5,6,19]],
"ms-dos": [9],
"projectopenrecentmenuitem": [[0,5,6]],
"miss": [17,0,[5,6,10],[3,13,18]],
"load": [13,[12,23],20,[9,19],[0,11,17]],
"alpha": [[3,13,20]],
"just": [0,[3,10,13],23,[5,7,19,21]],
"human": [12],
"divid": [[0,4],23],
"primarili": [13],
"collabor": [[10,13]],
"custom": [0,[11,12],13,[6,17],[3,5],10,[14,23]],
"editexportselectionmenuitem": [[0,5,6]],
"length": [12],
"issue_provider_sample.groovi": [23],
"und": [[7,21]],
"home": [0,[6,13],9,11,[1,2,3,4,5,7,8,10,12,15,16,17,18,19,20,21,22,23]],
"disable-location-sav": [[13,20]],
"print": [[0,3,13,20,23]],
"condit": [13],
"glyph": [17],
"unl": [18],
"although": [0,[3,13],[15,16]],
"projectaccesstargetmenuitem": [[0,5,6]],
"interpret": [0],
"editoverwritemachinetranslationmenuitem": [[0,5,6]],
"iana": [0],
"relat": [[12,13,19],18],
"console-stat": [[13,20]],
"grant": [13],
"ingreek": [[0,3]],
"explain": [5],
"lunch": [0],
"f12": [23],
"es_es.aff": [[7,21]],
"visibl": [[0,3,19]],
"convers": [13,[12,14]],
"ignor": [12,19,[0,17,18,23],[5,6,7,9,13,20,21]],
"convert": [13,12,10,[17,23]],
"elsewher": [[7,21]],
"hope": [10],
"attempt": [13,[12,20,23],9],
"editorswitchorient": [[0,6]],
"soon": [2,[17,19]],
"influenc": [17],
"projectexitmenuitem": [[0,5,6]],
"aligndir": [[9,13,20],23],
"system-host-nam": [12],
"action": [[17,23],13,0,[5,6,18],[9,10,12,15,20]],
"lock": [18,[9,13,20],[0,6]],
"adoptium": [[13,15,16]],
"text": [0,[12,23],17,18,13,3,11,2,[4,10],[19,20],[7,21],[9,14],[5,6,15]],
"latin": [0],
"mymemory.translated.net": [12],
"en-to-fr": [[9,13,20]],
"fear": [13],
"editregisteruntranslatedmenuitem": [[0,5,6]],
"creat": [13,23,10,12,19,17,0,9,15,[16,18],[2,5],[6,20],14,[7,21],4],
"init": [13,20],
"python": [23],
"es_mx.dic": [[7,21]],
"misspel": [[3,21]],
"made": [[0,9,10,13],[17,23],[3,11,12,15,16,18,19]],
"block-level": [[0,4]],
"manag": [10,[13,17],14,[7,21],[12,19]],
"manifest.mf": [[13,20]],
"maco": [0,6,13,[9,15],[5,20],17,18,[14,16],10,[2,11,12]],
"field": [23,18,17,[9,15],[12,13],[7,21],[0,4]],
"tarbal": [[1,19]],
"singl": [0,23,12,[3,4,9,10]],
"invalid": [20,9,13],
"doc": [23,0],
"doe": [0,13,3,[9,12,23],[2,10],17,[1,5,6,7,20,21]],
"output-fil": [[13,20]],
"notifi": [12],
"status": [18,17,13,12,[9,10,14]],
"mis-spel": [7],
"server": [13,12,[9,20],19,18],
"don": [10],
"natur": [3],
"dot": [[0,3,17]],
"paramet": [13,20,[0,11],9,15,[16,23],12,19],
"stamp": [[12,19]],
"run-on": [0],
"skip": [[0,6],[19,23]],
"www2": [12],
"overrid": [[12,13,20]],
"mac": [5,9],
"mention": [9],
"file": [13,23,12,0,17,19,9,10,20,15,11,18,2,[7,21],[6,16],5,14,[1,4],3],
"known": [[0,3,17]],
"member": [13,10],
"man": [9],
"stand": [9],
"can\'t": [13,[9,11]],
"map": [13,23,14,19],
"may": [[9,13],[0,15,23],[16,18],[7,21],[4,12,17,19,20]],
"within": [0,9,[12,13,19],[4,5,6,10,18]],
"case-insensit": [3],
"forward": [[0,17],[5,6]],
"could": [[2,12],[0,10,13,19,23]],
"trigger": [3,[0,13,20,23]],
"menu": [5,0,[6,18],23,[12,17],10,14,[13,19],9,11,[2,20],[1,4,7,15,21]],
"url": [13,12,19,[7,9,17,20,21,23]],
"megabyt": [[9,13,20]],
"system-wid": [0],
"uppercasemenuitem": [[0,5,6]],
"explan": [23,[0,2,4,9,12]],
"viewmarkuntranslatedsegmentscheckboxmenuitem": [[0,5,6]],
"discrep": [17],
"probabl": [2,13],
"relev": [13,0,12,[3,5,6,9,10,11,17,20]],
"needs-review-transl": [12],
"tagwip": [23],
"return": [23,0,[3,9,10,18]],
"nonsens": [0],
"usb": [13],
"use": [13,23,12,0,9,10,20,17,18,15,[3,19],7,21,2,5,[4,6,16],[11,14],1],
"usd": [23],
"feel": [[10,13],[9,15,16,19]],
"main": [[18,23],12,[5,13,17],[0,6,20]],
"newlin": [3,0,12],
"convent": [0],
"radio": [23],
"omegat.jar": [13,9,20,15,0],
"source-pattern": [9,[13,20]],
"strip": [23],
"omegat.app": [13,15,9,20,16,0],
"conveni": [9,15,[12,13,16,23]],
"fine": [0],
"usr": [15,[9,12,13,16]],
"find": [0,9,[3,13],[2,10,12,15,20],[5,11,19]],
"host": [13,[9,12,20]],
"logo": [0],
"backward": [17],
"errat": [[0,11]],
"credit": [17],
"regardless": [[13,15,16]],
"alter": [[9,23]],
"console-pseudotranslatetmx": [20],
"workflow": [0,10,[2,14,18]],
"utf": [0,2,[12,19]],
"autocompletertablepagedown": [[0,6]],
"occur": [9],
"difficult": [[13,20]],
"sort": [18,[12,17,23]],
"fill": [19,13,[17,20]],
"feed": [[0,3]],
"servic": [13,9,12,[15,18],[17,20]],
"forget": [12],
"task": [13,[15,16,20],[0,23]],
"cleanup": [23],
"background": [19,[17,18]],
"true": [[0,9,11]],
"xliff": [13,12],
"header": [12,[17,23]],
"nonetheless": [[0,4,23]],
"present": [0,[12,13,23],[17,18,20],[1,2,5,6,9,10]],
"dsl": [[1,19]],
"mid-transl": [23],
"belong": [[0,3,12]],
"groovi": [23],
"pre-defin": [[0,9]],
"multi-paradigm": [23],
"best": [12,[0,2,10,18,19,23]],
"n.n_windows_without_jre.zip": [9],
"med": [17],
"transform": [12],
"fundament": [[0,3]],
"execut": [[9,13,20],[12,15],[0,23]],
"hour": [[10,13]],
"kmenueditor": [[9,15]],
"dtd": [[9,12,13,20]],
"repeat": [6,[0,13,23]],
"make": [13,0,[12,19],[10,23],9,[3,7,18,21],[11,20],[5,6,14,15]],
"capit": [9],
"source-target": [1],
"sentence-level": [[0,4,23],10],
"abov": [13,[0,12],9,23,3,[15,16],[7,21],[1,2,6,10,14,17,20]],
"projectcompilemenuitem": [[0,5,6]],
"classnam": [[13,20]],
"console-transl": [9,[13,20]],
"messageformat": [12],
"stern": [10],
"compound": [12],
"master": [13,12],
"kmenuedit": [[9,15]],
"optionsautocompletehistorycompletionmenuitem": [0],
"gotonextuniquemenuitem": [[0,5,6]],
"due": [10,[13,15,16]],
"conform": [13],
"underlin": [17,2,[7,12,21]],
"xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx": [9],
"writer": [12],
"wordart": [12],
"merg": [23,10,[0,4,12]],
"dalloway": [12],
"rubi": [23],
"optionsviewoptionsmenuitem": [[5,6]],
"resource-bundl": [[13,20]],
"inform": [9,13,18,0,23,[12,15,17,20],[1,3,10,11,16,19]],
"depend": [[9,12,13],[0,17],[18,20],[2,5,6,10,23]],
"about": [0,[3,10,13,18,23],[5,6,9,15,17,19]],
"commit": [13,[0,17]],
"yyyi": [13],
"external_command": [19],
"targetlocalelcid": [12],
"ctrl-o": [5],
"annot": [10],
"project_stats_match.txt": [19],
"cover": [0,3,13],
"editorselectal": [[0,6]],
"tab-separ": [[0,2]],
"reflect": [[9,13],[0,10,15,17,19,20,23]],
"character": [12],
"flexibl": [10,2],
"xmx2048m": [9],
"runner": [23,0],
"immedi": [0,23,[17,18]],
"simlp": [12],
"pointer": [18],
"xxxxxxxxxxxxxxxx.xxxxxxxxxxxxxxxx.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx": [9],
"condens": [12],
"omegat-default": [15,[13,16]],
"benefit": [[9,23]],
"user.languag": [13,[9,15,20]],
"regex": [[0,3]],
"lower-cas": [3],
"highest": [18,12],
"meta": [[0,6],12,5],
"keystrok": [5],
"declar": [12],
"except": [12,0,[4,13],3,10],
"boost": [[0,3]],
"krunner": [[9,15]],
"libreoffic": [[7,10,21],12],
"autocompleterclos": [[0,6]],
"qualiti": [17],
"nevertheless": [10],
"scan": [23],
"global": [23,[0,12,17],4,14,11,13,[10,18]],
"long": [0,12,[9,17]],
"into": [13,23,12,[0,18],17,[10,19],[3,4,6],[1,5,9]],
"unless": [13,[0,10,12,15,16]],
"defin": [0,12,3,13,23,4,[17,18],[10,19,20],[5,6,7,21]],
"industri": [10],
"free": [13,9,10,[0,1,4,7,14,21]],
"mix": [13,[3,14]],
"untick": [4],
"evolut": [0],
"star": [[0,3]],
"though": [12],
"thorough": [0,[3,13]],
"stax": [13],
"everyday": [[13,15,16]],
"viewdisplaysegmentsourcecheckboxmenuitem": [[0,5,6]],
"appear": [12,9,[5,15,23],[6,10,18],[0,7,13,14,17,21]],
"editregisteremptymenuitem": [[0,5,6]],
"non-uniqu": [12,17,[0,5,6,23]],
"ibm": [[15,16],[9,12,13]],
"stats-output-fil": [[13,20]],
"mismatch": [23],
"french—if": [12],
"progress": [18,13,12],
"reliabl": [19,13],
"oper": [9,12,23,[13,17],[15,16,19]],
"mani": [0,13,3,[15,16]],
"open": [17,23,13,0,9,12,18,6,[3,5,10],20,[15,19],[7,14,16,21],[2,11]],
"treat": [0,[18,23],[3,12]],
"www.oracle.com": [9],
"parsewis": [23],
"project": [13,23,19,17,0,10,12,18,9,[2,5],6,20,[4,14],[7,21],[15,16],11,1,3],
"seven": [[0,3]],
"user-cr": [0],
"xmx1024m": [[9,13,15,20]],
"取得": [[12,23]],
"trustworthi": [13],
"whatev": [[7,13,21]],
"autotext": [12,[0,11]],
"sever": [23,[9,13,17,18],[0,2,12,14,19]],
"loop": [23],
"autocomplet": [[0,6],[2,14]],
"beforehand": [2],
"enclos": [0,23,[3,10,12]],
"penalty-xxx": [[13,19]],
"gotonextsegmentmenuitem": [[0,5,6]],
"invert": [12],
"nnn.nnn.nnn.nnn": [9],
"omegat-cod": [13],
"look": [10,[0,12],[3,13],[7,9,14,21,23]],
"repres": [0,3,12,[4,11,13]],
"abort": [[9,13,20]],
"left-to-right": [[0,17],13],
"guid": [0,17,10,14,[9,13]],
"idx": [[1,19]],
"unrestrict": [9],
"internet": [12,[7,21]],
"conflict": [13,[0,5,6,10]],
"allow": [23,12,17,0,[3,9],13,10,[18,20]],
"comma-separ": [[0,2]],
"squar": [0,3,12],
"commerci": [10],
"rule": [23,0,12,4,[3,17],[13,14],10,[9,11,19]],
"detect": [17,[2,9,13,20]],
"proper": [13,12,[9,17],[2,15,18,20,23]],
"everi": [13,[0,19,23],17,[3,10,12,15,16]],
"speed": [13],
"peopl": [[10,13,15,16]],
"printf": [12],
"summari": [13,14],
"outsid": [0,12,[3,10,18,19]],
"autocompleterconfirmandclos": [[0,6]],
"common": [13,[0,1,2,12,18,21],[4,10,14,20,23]],
"projectaccesscurrentsourcedocumentmenuitem": [[0,5,6]],
"appli": [[12,23],13,0,[3,9,15,16],[4,17,18,19]],
"interest": [[0,3]],
"linux": [0,6,9,13,15,5,[16,17,20],18,14,[10,11,23]],
"linux-install.sh": [[13,15,16]],
"again": [0,[2,9,12,13,18,23]],
"file.txt": [13],
"openxliff": [13],
"uncom": [[13,15,20]],
"writabl": [2,0,[17,19,23],[13,18]],
"es-mx": [[7,21]],
"layout": [12,10,[14,17,18],[0,11,23]],
"registri": [0],
"popup": [23],
"ifo": [[1,19]],
"popul": [[12,19]],
"step": [23,[0,13],[10,19]],
"comment": [[12,18],0,[2,17,23],[5,6,9,14,15]],
"bash": [[13,15,20]],
"basi": [[0,3]],
"excit": [0],
"mark": [17,0,23,12,[5,6],10,[3,18],19,[2,14]],
"base": [12,[10,23],[0,7,21],[1,9,13,14,17,18]],
"stem": [[2,12],18,[5,6]],
"registr": [12],
"disconnect": [13],
"compulsori": [23],
"optionsmtautofetchcheckboxmenuitem": [0],
"xx.docx": [12],
"prefix": [19,12],
"whole": [[0,3,5,9,10,12,13,19,20,23]],
"consist": [0,23,[4,10,13,17,18,19]],
"loss": [13],
"critic": [12],
"lost": [13,[10,14,18]],
"editorshortcuts.properti": [0,6,11],
"optionsautocompleteautotextmenuitem": [[5,6]],
"domain-specific-glossary.txt": [2],
"insertcharslr": [0],
"grammat": [17],
"zip": [[9,15]],
"still": [[0,23],4,[17,18]],
"compress": [[12,19]],
"work": [13,0,9,23,10,[4,7,21],[12,15,19,20],[5,6,16,17]],
"lose": [13,10],
"suitabl": [[7,9,21],15,[0,13,16,18]],
"fail": [13,[2,9,10,15]],
"itself": [0,[3,13],23,[4,15,16,19,20]],
"concis": [1],
"customer-id": [9],
"sdlxliff": [13],
"among": [13,[3,10]],
"variat": [0],
"word": [0,3,23,[17,19],12,18,[7,9,10,21],13],
"love": [[0,3]],
"lingue": [12],
"thumb": [23],
"auto-propag": [[13,23]],
"requir": [12,13,23,[0,9,15,16,17,18,20],[1,3,7,11,14,19,21]],
"across": [0,3],
"viewmarknotedsegmentscheckboxmenuitem": [[0,5,6]],
"non-vis": [12],
"event": [23,0,[5,6],[11,13,20]],
"simplest": [0,[3,9,13,15,20]],
"vcs": [13],
"lingvo": [[1,19]],
"gotomatchsourceseg": [[0,5,6]],
"abstract": [14],
"appropri": [13,[2,15],[0,16,20,23]],
"developer.ibm.com": [[13,15,16]],
"mrs": [12],
"opinion": [18],
"excel": [0,[4,12]],
"optionssaveoptionsmenuitem": [[5,6]],
"comma": [0,[3,12]],
"runn": [23],
"literari": [[0,4]],
"cannot": [13,[0,3,17,18]],
"runt": [0],
"averag": [23],
"stardict": [1,19],
"first": [0,23,17,[13,18],9,[6,12],[2,3,4],[5,7,10,19,21]],
"omegat.l4j.ini": [9,[13,15],16,20],
"span": [12],
"prefer": [11,12,0,18,17,[13,23],9,[2,14,15,16],[3,5,19]],
"quotat": [23,12,0],
"threshold": [12],
"overridden": [13],
"float": [12],
"space": [23,[0,3],[10,12],[6,18],17,14,[2,4,5]],
"pt_pt.aff": [[7,21]],
"hard-and-fast": [23],
"ドイツ": [23,12],
"manipul": [18],
"simpl": [0,12,3,[10,13],[2,4,11,14,23]],
"html": [12,9,[13,20],[0,4],10],
"from": [13,23,0,[15,19],9,20,18,12,5,16,[6,7,11,21],[2,10,17],3,4],
"portugues": [[7,9,21]],
"spell": [7,21,[0,12],17,[6,11,23],[1,3,5]],
"thunderbird": [[7,21]],
"editselectfuzzy3menuitem": [[0,5,6]],
"you\'ll": [13],
"bottom": [23,12,18,17,5],
"insertcharsrl": [0],
"blackslash": [3],
"artund": [[7,21]],
"templat": [12,14],
"fals": [[0,11],[9,13,15,20,23]],
"project.projectfil": [23],
"uncondit": [19],
"frequenc": [13],
"jres": [[9,13,15,16]],
"www.ibm.com": [[9,12]],
"frequent": [0,[5,6,9,10,13,15,20,23]],
"interact": [[13,20,23]],
"outright": [10],
"error": [13,9,[18,20],17,[0,3,10,23]],
"egregi": [0],
"platform": [13,[16,20],[0,9],15,[5,6,14],2],
"network": [[9,13]],
"shortcut": [0,5,6,17,[10,23],9,[14,15,18],[11,13],[12,16,20,21]],
"public": [13],
"briefli": [[0,18]],
"track": [18],
"toolsalignfilesmenuitem": [0],
"pt_br.aff": [[7,21]],
"tmx2sourc": [[13,19]],
"ini": [[9,13,15,20]],
"spent": [0],
"overal": [[0,11,17]],
"improv": [0,[3,23]],
"instead": [[0,12],[5,9,13,17,18,23]],
"command": [9,23,13,20,12,15,[0,17],5,19,[6,11,18],[4,16],[10,14]],
"project-specif": [19,12,17,[13,23]],
"change.txt": [[15,16]],
"unlik": [[0,3,10,12]],
"n.n_without_jr": [9],
"round": [13],
"dhttp.proxyport": [9,[13,20]],
"detach": [23],
"slash": [0],
"tag-fre": [23],
"www.microsoft.com": [12],
"negat": [3,0],
"notat": [[0,6],[10,12]],
"viewmarkbidicheckboxmenuitem": [[0,5,6]],
"refus": [10],
"year": [[0,13]],
"subrip": [[9,13,20]],
"branch": [13],
"via": [13,20],
"describ": [[0,13],3,[5,9,20],[6,10,11,12,15,16,18,23]],
"score": [12,23,19],
"fileshortpath": [12],
"permiss": [23,9],
"poor": [23],
"visual": [[0,4,17]],
"double-click": [9,[13,15,23],20,[12,16,17,18]],
"absent": [[13,20]],
"near": [0],
"approxim": [23],
"日本語": [23],
"agreement": [9],
"appendix": [3,[1,2,7,21],[4,5,6],0,[9,18,23]],
"instruct": [13,[15,16],9,[7,12,21],[0,19,20,23]],
"illustr": [0],
"raw": [13],
"version": [13,15,9,16,0,3,[7,17,19,21,23]],
"unassign": [17],
"folder": [13,23,19,0,9,17,12,15,16,11,20,[2,10],18,[14,21],[1,5,6,7],8],
"stop": [12,9],
"handl": [12,13,[0,3]],
"detail": [13,[17,23],0,12,10,[11,19],18,15,20,16,[3,4,6,9]],
"retriev": [[9,13,15,16]],
"contemporari": [1],
"solari": [9],
"projecteditmenuitem": [[0,5,6]],
"least": [13,[3,20,23]],
"manual": [[13,23],[0,5,17,19],[11,15,16],[2,3,6,7,21],[10,20]],
"britannica": [1],
"dollar": [0,3],
"new_word": [23],
"recycl": [13],
"run\'n\'gun": [0],
"aspect": [10],
"appendic": [[0,8],[12,14,22]],
"unbeliev": [0],
"measur": [13],
"nashorn": [23],
"machin": [12,17,18,[13,23],[0,9,14],[5,6,19,20]],
"behavior": [[9,13],[2,5,6,15,17,20]],
"close": [0,23,3,13,[6,17],[5,11,12,18]],
"unsung": [0],
"abc": [[0,3]],
"vocabulari": [[7,21]],
"learn": [0,[5,6,15]],
"last_entry.properti": [19],
"abl": [13,9,[0,5,6,7,10,12,21,23]],
"textual": [23,[0,4]],
"toolbar.groovi": [23],
"newer": [17],
"uppercas": [0,3],
"invok": [23],
"iso": [0,[13,20],[2,12]],
"eager": [10],
"isn": [[0,13]],
"optionspreferencesmenuitem": [0],
"thorni": [0],
"autocompleternextview": [[0,6]],
"specif": [23,13,12,[0,9,17],3,[5,15,16,20]],
"red": [[12,19],[0,3,23]],
"aggreg": [12],
"act": [19,12],
"post": [0],
"soft-return": [12],
"glossary.txt": [[13,19],[0,2,17]],
"finish": [23,0],
"dsun.java2d.noddraw": [[9,13,15,20]],
"mispel": [0],
"placehold": [12,13],
"add": [13,[0,23],19,12,10,[9,15],[2,17,18],5,6,[3,7,21]],
"initi": [23,[0,9,13,19],12,[15,20]],
"multi-word": [[0,2]],
"chines": [[9,12]],
"ell": [12],
"need": [13,0,9,15,16,[10,12,19,23],[5,6,7,21],[2,3,18]],
"equival": [23,[0,12,13],[4,5,9,11,18,20]],
"often": [10,[0,13],[3,23]],
"editorfirstseg": [[0,6]],
"gather": [13],
"els": [18],
"respect": [[13,19],[0,12,20]],
"rfe": [23],
"canada": [[9,13,15,20]],
"shell": [[0,11]],
"port": [[9,13,20]],
"pre-configur": [12],
"altern": [12,[0,23],17,18,[13,15],[3,5,6,9,11]],
"isol": [11],
"entry_activ": [23],
"http": [13,[9,12],18],
"optionsautocompleteshowautomaticallyitem": [[0,5,6]],
"trust": [12],
"untar": [9,[1,13,15,16]],
"interfer": [9,17],
"lisenc": [0],
"consequ": [[7,9,10,13,21]],
"prevent": [13,20,10],
"undo": [17,[0,5,6]],
"filters.conf": [9],
"glitch": [10],
"softwar": [13,[0,9]],
"ishan": [[0,3]],
"scope": [[0,3,10,23]],
"pasta": [0],
"projectsinglecompilemenuitem": [[0,5,6]],
"end": [0,3,23,6,[9,12,13,20]],
"lisens": [0],
"footnot": [12],
"modifi": [0,23,13,12,[5,6,10],15,9,20,[14,16,19],[4,17,18],[2,3,11]],
"otherwis": [13,[19,23]],
"myfil": [13],
"particip": [13],
"anyth": [[0,4,5,6,10,11,13]],
"label": [[12,17]],
"howev": [9,[0,7,13,21,23],[2,10]],
"fledg": [13],
"special": [0,3,[12,13,19,23]],
"okapi": [13],
"togeth": [10],
"page_down": [[0,6]],
"key-bas": [23],
"numer": [[0,13]],
"clone": [13],
"fine-tun": [18],
"targetlanguag": [12],
"directori": [13,20,[0,11]],
"sensit": [0,23,3],
"backup": [13,19,[15,16],[11,12,14,23]],
"copyright": [17],
"properti": [13,18,[12,17,19,23],[0,10],[2,4,7,14,20,21],[5,6,9]],
"project_nam": [23],
"system-os-nam": [12],
"occurr": [23,[7,21]],
"insertcharspdf": [0],
"editselectfuzzyprevmenuitem": [[0,5,6]],
"optionstabadvancecheckboxmenuitem": [[5,6]],
"number": [0,23,[12,18],13,17,[3,19],20,[2,6,9,10,11],[4,5,15,16]],
"identifi": [12,0,17,[10,13,14,23]],
"specifi": [13,[0,9,20],12,11,[5,18],[3,6,7,15,16,19,21,23]],
"heapwis": [23],
"optionsviewoptionsmenuloginitem": [[5,6]],
"narrow": [10],
"faulti": [13],
"algorithm": [23,[0,5,6,17]],
"shorter": [23],
"troubleshoot": [[13,22],[4,10,14,19]],
"newli": [[11,19]],
"similar": [[0,12],13,[10,18],[3,4,9,17,23]],
"tar.bz2": [[1,19]],
"paragraph-level": [[0,4]],
"isjoin_control": [3],
"forth": [13,18],
"bundle.properti": [13],
"script": [23,15,13,0,17,[9,20],12,16,14,[3,11],[8,19]],
"contributors.txt": [0],
"exit": [[13,20,23],17],
"system": [13,9,15,20,12,[16,17],[0,7,21,23],19,[5,6,11,18]],
"default.th": [[13,20]],
"driver": [12],
"spellcheck": [12,19,[7,21,23],13,[0,14,17]],
"www.regular-expressions.info": [[0,3]],
"x64": [9],
"characterist": [12,23],
"issu": [12,17,13,10,[0,1,2,21],[14,19]],
"partial": [[13,20]],
"other": [13,0,9,12,[3,19,23],[2,10,15,18],[14,20],[4,17],16,[1,6,7,11,21]],
"keyev": [5],
"against": [[7,10,13,18,21]],
"retain": [13,[9,12,15,16]],
"savor": [0],
"parenthes": [[0,12],3],
"cell": [23,[0,4]],
"login": [12,[0,5,6,11,14]],
"isn\'t": [[3,15,16]],
"local": [13,23,12,0,4,[9,17],15,[11,14,16,18,19,20]],
"optionsdictionaryfuzzymatchingcheckboxmenuitem": [0],
"resum": [0],
"remind": [[0,17,19]],
"valid": [[0,9],[5,6,12,17,20],[2,3,13,19]],
"pictur": [0],
"assur": [17],
"interfac": [13,20,9,0,[11,12,15],[10,16,18]],
"projet": [18],
"locat": [13,23,0,20,9,15,17,12,[2,19],10,[11,16],18,[3,14],[7,21]],
"yield": [23],
"share": [13,23,19,[10,14],[0,4,15,16,18]],
"sourcelanguag": [12],
"optionsteammenuitem": [[5,6]],
"rle": [[0,17]],
"gzip": [19],
"helpupdatecheckmenuitem": [0],
"duplic": [23,18,[10,12]],
"repo_for_all_omegat_team_project_sourc": [13],
"notic": [[13,23]],
"rlm": [[0,17]],
"esc": [18],
"x86": [9],
"exampl": [0,3,12,23,13,18,9,[14,17],[10,20],[7,15,19,21],[2,4,5,6],11],
"nostemscor": [12],
"first-third": [13],
"es_mx.aff": [[7,21]],
"project_chang": [23],
"round-trip": [13],
"screen": [0,[3,9]],
"mexican": [[7,21]],
"correspond": [23,[0,17,18],[7,12,19,21],[4,5,9,13]],
"c-x": [[0,3]],
"console-createpseudotranslatetmx": [9,13],
"mode": [9,13,20,23,18,3],
"etc": [12,23,[3,9,10,13,19],[1,18]],
"longman": [1],
"fuzzyflag": [12],
"toolsshowstatisticsstandardmenuitem": [5,[0,6]],
"all": [23,13,12,[0,17],9,[10,15,16],2,19,[5,6],[3,4],[7,11,18,20,21]],
"precaut": [13],
"border": [18],
"new": [13,23,0,10,[15,17],9,12,16,5,6,4,[2,7,11,19,21],[3,14,18]],
"escap": [[0,6],9,[2,13,20]],
"took": [13],
"read": [23,13,0,[12,20],[2,5,6,9,15]],
"simplic": [[2,13,20]],
"sequenti": [17],
"below": [0,13,9,20,[3,5,18],[1,2,6,7,12,17,19,21,23]],
"c.t": [0],
"alt": [0,6,5,17,[9,15]],
"poisson": [23],
"runway": [0],
"rememb": [13,[10,20],[0,17],[5,6,23]],
"choos": [12,15,[13,23],[0,16],[2,7,9,21]],
"half-width": [23],
"real": [13,18],
"tool": [13,23,5,[0,14,17,19],12,[4,6,9,10,20]],
"ll-cc.tmx": [13],
"unit": [0,4,23,12],
"alreadi": [13,9,12,19,[0,7,21,23],[5,17,20]],
"therefor": [0,[9,23],13,4],
"bodi": [[7,21]],
"collect": [[0,3,19]],
"two-lett": [[13,20]],
"redo": [[0,5,6,17]],
"media": [13],
"slot": [17],
"around": [[10,12]],
"simpler": [[7,13,21]],
"grunt": [0],
"n.n_without_jre.zip": [9],
"reload": [23,17,[0,10,13,19],[2,4,5,6]],
"tkit": [13],
"calcul": [[12,18],23],
"and": [13,0,23,12,9,17,18,10,[3,19],15,20,5,2,6,[7,21],16,4,[11,14],1],
"synchron": [13,[18,23],[9,10,12,19,20]],
"chose": [5],
"predict": [[0,12]],
"row": [23,[0,6,17]],
"ani": [0,13,23,3,9,19,[10,17],2,[12,18],[15,16],6,[5,20]],
"render": [23],
"magento": [[9,13,20]],
"backs-up": [[13,19]],
"ant": [[13,23]],
"korean": [12],
"boundari": [3,0,10],
"dispar": [13],
"offlin": [13,9],
"ll_cc.tmx": [13],
"unnecessari": [19,12],
"u00a": [23],
"until": [13,[0,9,12,15,16,23]],
"helplastchangesmenuitem": [[0,5,6]],
"omegat.ex": [9,[13,15,20]],
"reason": [0,[7,9,17,21]],
"thought": [13],
"shift": [6,0,5,17,23,2],
"sourcetext": [12],
"simultan": [12],
"compos": [6],
"java": [9,13,20,15,12,16,[0,3],5,23,6],
"exe": [[9,13,15,20]],
"english": [13,3,[1,9,12,20]],
"xmxsize": [[13,20]],
"jar": [9,13,20,15],
"mistak": [12,[10,17,23]],
"api": [9,12],
"editselectfuzzy2menuitem": [[0,5,6]],
"project_save.tmx": [13,19,[10,23],17],
"encapsul": [23],
"perus": [15],
"dictionari": [[7,12],21,19,1,18,[0,17],23,14,11,[2,5,6,9,13]],
"remain": [23,19,17,[9,13]],
"powershel": [[13,20]],
"eye": [[0,13]],
"letter": [0,3,17,[5,23],[10,12,13]],
"grade": [10],
"editornextseg": [[0,6]],
"appl": [0],
"editselectfuzzynextmenuitem": [[0,5,6]],
"recommend": [13,[15,16],[0,23]],
"worth": [[0,23]],
"read.m": [12],
"default": [0,12,23,13,5,17,[2,18],[19,20],6,3,[9,10,11],14,4,[15,16]],
"gray": [17,[12,23],10],
"are": [13,23,0,12,17,9,18,19,10,[3,15],20,[2,16],5,4,[1,6,7,11,21]],
"cloud.google.com": [12],
"taken": [[6,12,19],[5,13,17,18,23]],
"readme.bak": [13],
"where": [0,23,13,17,[3,5,9,12,18],10,19,[4,6,7,15,20,21]],
"sudo": [[13,15,16]],
"drop-down": [[12,23],[7,21]],
"timestamp": [[12,13,14]],
"logogram": [0],
"broken": [[10,13]],
"art": [[7,21]],
"vice": [23,13],
"projectaccessrootmenuitem": [[0,5,6]],
"dyandex.api.key": [9],
"nest": [[0,2]],
"rtl": [13,14,[0,6,17]],
"fulli": [19],
"call": [0,[13,23],17,9,[3,4],[2,6,7,11,12,15,16,18,19,20,21]],
"jdk": [9],
"facilit": [10],
"such": [0,13,12,23,10,18,[3,19],[1,4,9,11,17]],
"plugin": [13,12,0,11,14,[10,15,16]],
"autocompletertableup": [[0,6]],
"essenti": [[7,13,21]],
"ask": [13,23,[12,17],[0,3,9,10,18]],
"principl": [3,[10,14,18]],
"tabul": [3],
"understood": [23],
"through": [13,23,[0,18],[3,9,12,17,20]],
"toolsshowstatisticsmatchesperfilemenuitem": [[0,5,6]],
"strength": [23],
"projectcommitsourcefil": [0],
"editinsertsourcemenuitem": [[0,5,6]],
"run": [9,23,13,15,0,16,20,17,[6,12],[5,10,11,14]],
"viterbi": [23],
"microsoft": [12,9,[10,13]],
"reorgan": [[0,4]],
"projectnewmenuitem": [[0,5,6]],
"ecmascript": [23],
"worri": [10],
"technolog": [9],
"either": [0,13,3,[12,19],[4,10],[7,20,21,23]],
"view": [[0,5,6,12],[10,14],[17,18,23],[2,9,11,19]],
"lowercas": [0],
"white": [3,0,17],
"editorshortcuts.mac.properti": [[0,6]],
"optionstranstipsenablemenuitem": [[5,6]],
"segment": [23,0,17,12,18,4,19,10,6,13,5,11,3,14,9,2],
"changes.txt": [[0,13]],
"titlecasemenuitem": [[0,5,6]],
"huge": [[7,21]],
"yourself": [[10,13]],
"those": [[0,13],23,[10,19],3,[2,4,11,12,17,18,20]],
"glossari": [2,0,18,23,[17,19],12,5,6,[10,13],14,[1,3,7]],
"recurs": [23],
"editcreateglossaryentrymenuitem": [5,[0,6]],
"ignored_words.txt": [19],
"might": [13,15,[10,16],[0,3,9,20]],
"configuration.properti": [9,[13,15],20,16],
"github.com": [13],
"ital": [[0,3,10]],
"bold": [18,23,[0,2,3,10,12]],
"dure": [9,[13,23],[0,10,15,16,19]],
"autocompleterlistpageup": [[0,6]],
"effici": [10],
"longer": [[13,15,16],[0,3,4,9,23]],
"introduc": [23],
"privat": [9],
"supersed": [23],
"多和田葉子": [23],
"occupi": [23],
"reopen": [13],
"name": [12,13,9,18,[10,23],[7,15,19,21],[0,20],2,[1,3,5,16,17]],
"physic": [[7,13,15,16,21]],
"recreat": [[10,12,13,19]],
"next": [0,17,6,23,5,[10,13],12,18,4,9,[1,2,3,7,11,14,15,16,19,20,21,22]],
"import": [[0,13],11,[2,4,9,10,18,19]],
"string": [23,12,17,[3,13],[0,9,15,20],[1,10]],
"hidden": [[3,19]],
"color": [12,17,[3,19],14],
"submit": [11],
"reli": [0,[4,13],[3,15,16]],
"book": [[0,10,19]],
"show": [23,18,12,13,20,[0,9,15],[5,6,17,19]],
"cautious": [13],
"disappear": [[7,21]],
"target-languag": [[13,20]],
"non": [12,10],
"nor": [[0,3,9]],
"button": [23,12,[9,15],10,[0,5,6,7,21]],
"comput": [[9,13],20,[10,12]],
"not": [0,12,13,23,3,[9,10],17,2,19,18,[4,20],[6,15,16],[7,11,21],5],
"now": [[0,13],[3,5,6]],
"introduct": [10,14,[13,16]],
"trademark": [18],
"semi-autom": [[15,16]],
"factor": [17],
"editortogglecursorlock": [[0,6]],
"enabl": [12,0,[9,13,15,18,23],[3,4,5,6,7,10,16,20,21]],
"greek": [[0,3]],
"green": [23,18,17],
"associ": [12,13,17,20,[9,10,15],[0,6,14,18,23]],
"pseudotransl": [[13,20]],
"was": [12,[0,13,23],17,[10,19]],
"subfold": [2,0,[9,13],[7,19,20,23]],
"greet": [0],
"new_fil": [23],
"selection.txt": [[0,11,17]],
"way": [0,13,[9,12],[3,23],17,[2,5,6,7,11,15,20,21]],
"xhtml": [12,[0,4]],
"target": [12,17,13,23,[7,21],19,0,[2,9,10,18,20],[5,6],14],
"grey": [17],
"what": [12,[0,3,10,13,23],[4,9,20]],
"itoken": [[13,20]],
"knowledg": [13],
"finder.xml": [[0,11,19,23]],
"refer": [0,13,3,19,2,23,10,[9,12,14,18,20]],
"workfow": [0],
"colon": [0],
"window": [23,9,0,[6,17],18,13,20,5,15,[12,14],[7,16,21],[10,11,19],3],
"call-out": [17],
"config-dir": [[9,13],[15,16,20]],
"editorskipprevtokenwithselect": [[0,6]],
"discard": [23],
"any—wil": [12],
"criteria": [23,[10,12]],
"disable-project-lock": [[9,13,20]],
"displac": [17],
"omegat.pref": [[0,11,23]],
"when": [23,12,[0,13],9,[18,19],[3,11],[10,17,20],[2,15,16],4],
"termbas": [[0,2]],
"client-specific-glossary.txt": [2],
"sequenc": [0,3],
"auto-popul": [[12,17],[0,5,6,19]],
"carriage-return": [3,0],
"far": [18,13],
"embed": [[0,17]],
"catch": [13],
"plan": [12],
"case": [0,[5,17],3,6,23,[9,13],12,4],
"give": [13,[0,2,6,9,17],[5,10,19,20,23]],
"item": [5,0,6,17,23,9,15,12,[10,13]],
"multipl": [[0,18],[6,12,13,20],[9,14,15]],
"violet": [17],
"unfriend": [10],
"matcher": [[0,3]],
"lowest": [18],
"pt_pt.dic": [[7,21]],
"explicit": [13],
"targettext": [12],
"consid": [12,19,[0,4,10,17,23]],
"slide": [12],
"everyth": [[0,9,13,15]],
"reset": [23,12],
"style": [13,23],
"explor": [[0,3]],
"suit": [0,[2,6,13,18]],
"card": [23,12],
"care": [10],
"widget": [[14,18]],
"orang": [[0,17,19,23]],
"portion": [[0,23],17],
"mose": [12],
"guard": [13],
"pattern": [12,0,23,[3,13],4,20],
"direct": [13,[9,15],[16,20],[0,17],[11,18,19,23]],
"compil": [23],
"caus": [9,2,[0,17]],
"mechan": [[0,4,13,17]],
"modern": [[13,20]],
"web": [9,12,23,13,[0,3,10,18]],
"edittagpaintermenuitem": [[0,5,6]],
"en-us_de_project": [13],
"you\'r": [10],
"temporarili": [12],
"symlink": [[13,15,16]],
"older": [13],
"protect": [[10,12]],
"optionscolorsselectionmenuitem": [[5,6]],
"nth": [23],
"editselectfuzzy4menuitem": [[0,5,6]],
"editregisteridenticalmenuitem": [[0,5,6]],
"more": [0,23,3,9,12,[10,13,19],[4,15,18],[5,6,14,16,17,20]],
"display": [23,12,17,18,0,[2,13],5,[6,19],[9,10],14,[4,11,15]],
"hanja": [0],
"great": [10],
"unicod": [0,12,17,[3,14]],
"viewmarknbspcheckboxmenuitem": [[0,5,6]],
"availab": [0],
"fanci": [[0,3]],
"usag": [[2,21,23],[9,13,14,20]],
"computer-assist": [[10,14]],
"pt_br.dic": [[7,21]],
"left-hand": [23],
"advanc": [23,0,[12,17],[2,3,5,6,9]],
"certain": [13,[12,17,18,20]],
"shut": [23],
"unabridg": [1],
"en-us": [12],
"overwrit": [18,19,[12,13,17]],
"fed": [[9,13,20]],
"path-to-omegat-project-fil": [[13,20]],
"whitespac": [0,12,4,3,[5,6,17]],
"credenti": [12,13,[14,18]],
"section": [0,13,3,[2,6,9,18,20]],
"auto-complet": [[0,12],[5,6],[10,18],[14,17],11],
"simpli": [0,3,[9,10,13,15],[2,7,16,19,20,21,23]],
"cloud": [13],
"protocol": [13,12],
"optionsglossaryexactmatchcheckboxmenuitem": [[5,6]],
"msgstr": [12],
"few": [0,10,[3,5,6,13],[4,9,12,14,23]],
"dict": [12,1],
"untransl": [12,23,17,18,[0,5,6,10,13],19],
"orient": [[0,6]],
"nationalité": [12],
"kind": [[0,12]],
"daili": [0],
"resiz": [18],
"both": [23,13,[0,12],[3,9],[15,16,18,20]],
"most": [0,[5,13],6,3,[9,17],[12,18,23],[10,11,19]],
"delimit": [12,23,[10,17,18],0],
"nnnn": [9],
"phrase": [0,23,3],
"omegat.project": [13,19,9,20,[10,12,14,18]],
"marker": [12,18,[0,3]],
"effect": [3,0,23,4],
"keep": [23,13,12,[0,10,15,16,19],[3,9,11,18]],
"whi": [0],
"topic": [[0,13]],
"excludedfold": [13],
"targetcountrycod": [12],
"job": [0,[10,13]],
"fallback": [17,12,0],
"option": [12,23,13,[17,20],[0,9],[2,14,15],5,[3,10],[7,21],[6,11,19],[16,18]],
"who": [[12,23],[10,13,15,16]],
"overtyp": [[0,6]],
"webstart": [9],
"insert": [17,0,12,[18,19],[6,23],5,[10,13],[2,4]],
"continu": [0,[2,10,12,23]],
"everyon": [13],
"resid": [[9,13,15,20]],
"highlight": [23,18,19],
"along": [0,[4,23]],
"arrang": [12],
"sheet": [12],
"messag": [9,18,[0,11,13]],
"prerequisit": [9],
"rest": [0,[5,10,12,13]],
"move": [17,23,18,[0,4,10],12],
"amount": [9,[13,15,20]],
"also": [13,23,0,15,9,12,20,19,17,[10,16],2,18,[3,7,21],[5,11]],
"enough": [13],
"differ": [12,13,[17,23],18,[0,10],9,[5,7,11,15,16,20,21]],
"conson": [[0,3]],
"consol": [9,[13,20]],
"situat": [13,12],
"mous": [23,[0,17,18]],
"vice-versa": [13],
"yandex": [9,12],
"various": [0,[12,17],[10,13],23,[2,3,11,15,16,18,19,20]],
"archiv": [[1,9,19]],
"front": [13],
"visit": [17,19],
"user": [9,13,0,20,[12,17],[5,11],[14,15],[6,10,18,23],3],
"a123456789b123456789c123456789d12345678": [9],
"itokenizertarget": [[13,20]],
"viewmarkwhitespacecheckboxmenuitem": [[0,5,6]],
"proxi": [9,[12,13,20],[5,6,14]],
"extens": [12,13,[0,2],1,[19,20],[11,14,15,17,18,23]],
"back_spac": [[0,6]],
"potenti": [0,[17,19]],
"asterisk": [[0,3]],
"bring": [23,[0,13,18]],
"tooltip": [18],
"complet": [12,0,[13,15,16],[9,23]],
"recalcul": [23],
"bak": [13,19],
"canon": [[0,3]],
"offer": [13,10,[12,18],[0,3,9,15,16,23]],
"fit": [10],
"robot": [12],
"bar": [18,[0,3,9],14],
"claus": [0],
"fix": [13,[0,2,11,17,19]],
"built-in": [[7,12,21]],
"bat": [9],
"complex": [0,[3,23]],
"draft": [14,10],
"jre": [9,[13,15,16]],
"rang": [0,3,[7,13,21]],
"optionsfontselectionmenuitem": [[5,6]],
"despit": [23],
"posit": [0,17,[3,18,23],4,[12,14]],
"eclips": [13,[15,16]],
"ad": [9,[0,13,23],12,[2,10,15,16,17,19]],
"sure": [13,12,9,[7,18,21,23]],
"reus": [13,[0,10,14,17]],
"diff": [12],
"automat": [23,13,19,12,17,[0,9],10,[7,11,15,20,21],[2,5,6,14,16,18]],
"an": [0,13,3,12,23,9,[10,15,20],[2,17,18],[7,19,21],16,11,4],
"editmultiplealtern": [0,[5,6]],
"secur": [12,23,[9,14]],
"panic": [10],
"extend": [[13,23]],
"as": [0,13,23,12,[3,17],9,15,[19,20],[10,18],2,4,16,5,[7,21],[1,6,11]],
"day-to-day": [[0,3]],
"git.code.sf.net": [[9,15,16]],
"at": [23,0,12,17,13,9,[3,18],10,[4,19],[2,15,16,20],[5,11]],
"predefin": [12,[0,4,13,15,20]],
"seconds—between": [12],
"constitut": [0,[4,12,13,19]],
"hierarchi": [19,13],
"ordinarili": [0],
"drive": [[9,13]],
"alllemand": [23],
"non-gui": [[13,20]],
"deal": [[12,23]],
"be": [13,12,0,23,9,17,19,10,3,6,5,15,[16,18,20],2,[4,7,21],11,1],
"prove": [3],
"affect": [13],
"icon": [9,15,17,18],
"delet": [13,15,16,0,6,12,[10,17],[9,11,14,19,23]],
"filters.xml": [12,[0,11,13,19,23]],
"proven": [0],
"version-control": [13],
"br": [[9,12]],
"projectaccessglossarymenuitem": [[0,5,6]],
"see": [13,23,17,10,[0,12],19,11,18,15,20,[3,9,16],[4,6],[7,21]],
"search": [23,0,12,17,3,10,14,6,18,[5,11,13],[1,19]],
"by": [0,13,23,3,12,19,4,[10,15],9,[17,18,20],16,[5,6],2,[7,21],[1,11]],
"segmentation.conf": [[0,9,11,13,19,23]],
"developp": [13],
"panel": [9,[15,23],12],
"ca": [[9,13,15,20]],
"developerwork": [9],
"cc": [13,20],
"cd": [9,[15,20]],
"ce": [[9,13,20]],
"contain": [19,0,23,13,11,[9,12],2,[10,15,18,20],[4,16],[1,5,7,17,21]],
"set": [12,13,23,0,9,17,19,10,20,14,[2,4,15],[3,5,7,16,21],[6,11,18]],
"incorrect": [19],
"column": [23,[0,2,17],12],
"cn": [9],
"freeli": [[0,3]],
"megat": [3],
"optionsrestoreguimenuitem": [[5,6]],
"figur": [[7,18,21],[10,13],[9,14]],
"cs": [[0,3]],
"renam": [13,[0,6,7,21,23]],
"instantan": [13],
"partner": [13],
"somewhat": [[0,9]],
"project.sav": [13],
"apach": [13,[7,21,23]],
"adjustedscor": [12],
"font": [12,17,[0,5,6,14,18]],
"dd": [13],
"justif": [13],
"de": [18],
"featur": [12,23,[1,10,13]],
"terminolog": [2,0,17],
"offic": [13,[10,12,23]],
"repositories.properti": [[0,11,13]],
"extern": [23,12,17,0,[11,18],[2,5,6,10,13,14,19]],
"forc": [12,[17,23]],
"do": [0,12,13,23,9,[10,17,20],[2,4,5,7,11,15,16,18,21],[6,19]],
"f1": [[0,5,6,17,23]],
"f2": [[0,18],[6,9,15,23]],
"f3": [[0,6],[5,17,18]],
"parti": [[10,13,18]],
"f5": [[0,5,6,10,17]],
"two-digit": [9],
"dz": [[1,19]],
"startup": [9],
"projectsavemenuitem": [[0,5,6]],
"editundomenuitem": [[0,5,6]],
"rare": [13],
"contact": [18],
"xmx6g": [[9,13,15,20]],
"autocompletertablefirstinrow": [[0,6]],
"digit": [0,3,13],
"which": [13,[0,23],9,[3,15,20],17,[12,16],[4,7,10,19,21]],
"jvm": [20],
"signific": [[2,12]],
"belazar": [12],
"en": [0,[3,12]],
"carri": [[9,17,23]],
"eu": [17],
"never": [0,[10,12,17,19]],
"she": [0],
"ex": [13],
"aggress": [17],
"adjust": [23,[2,19]],
"activ": [17,0,12,[3,11,18,23],19],
"first-class": [23],
"compat": [12,9,[13,15,16],23],
"compar": [23,0],
"frame": [9],
"cursor": [18,[0,17],4,23,[2,6]],
"prototype-bas": [23],
"indic": [18,[0,13,17],[9,12]],
"insertcharslrm": [0],
"origin": [13,23,[0,10,11],[4,12,18],2],
"foo": [12],
"for": [13,0,23,12,17,10,9,20,19,15,3,18,[7,21],11,5,16,[2,4,6],1],
"exclud": [13,23,0,3],
"fr": [[9,13],[12,20],[7,15,21]],
"content": [12,0,[13,23],10,[5,6,9,11,19],20,15,14,17,[1,3],18],
"duckduckgo": [12],
"hover": [[17,18]],
"desktop": [9,[13,15,20]],
"decor": [10,[0,3]],
"applescript": [[9,13,15,20]],
"skill": [13],
"client": [[2,13],12,[0,9,15,16,19]],
"json": [[13,20]],
"exclus": [23,13],
"gb": [9,[13,15,20]],
"gc": [3],
"class": [0,3,14],
"helplogmenuitem": [[0,5,6]],
"over": [17,9,15,[13,16,18,19]],
"spanish": [[7,21]],
"six": [10],
"someth": [[9,12,13]],
"easy-to-us": [10],
"editoverwritetranslationmenuitem": [[0,5,6]],
"outputfilenam": [9],
"falso": [12],
"bound": [23],
"go": [0,6,10,[17,18],[13,14,23]],
"counter": [23],
"kept": [19,[12,13,23]],
"aeiou": [[0,3]],
"form": [0,23,9,[5,6,12,13]],
"publish": [13],
"setup": [[7,21],9,[3,13,15,20]],
"restor": [17,[12,13],18,[5,6,11,19,23]],
"avoid": [[0,6,13],[10,23]],
"foundat": [[13,15,16]],
"prompt": [[13,20]],
"subset": [[0,13]],
"assign": [9,[0,17],23,[5,6],[2,12,19],[10,13,18,20]],
"typograph": [17],
"hh": [13],
"select": [17,23,[0,12],9,6,[13,18],5,15,[7,21],[10,11,20],[1,2,4,14,16,19]],
"duser.languag": [9,[13,20],15],
"viewmarkparagraphstartcheckboxmenuitem": [0],
"bin": [15,[12,13,16]],
"canadian": [12],
"degre": [0],
"easili": [10,[13,19],16],
"apertium": [12],
"bit": [10],
"bis": [[0,3]],
"kaptain": [[13,15,20]],
"meta-inf": [[13,20]],
"clipboard": [17],
"repetit": [17,[0,4,12,23]],
"output": [13,20,12,[5,6,9,14,23]],
"veri": [10,23,[0,3,12],13],
"file-target-encod": [12],
"projectopenmenuitem": [6,5,0],
"autom": [[9,13,15,20],[10,12,23]],
"corner": [18],
"four": [0,[3,13,17]],
"decim": [0],
"mainmenushortcuts.mac.properti": [[0,6]],
"context": [12,18,17,[0,2,5,6,10,13,19]],
"ordinari": [0],
"model": [[12,23]],
"https": [13,12,[15,16],[0,3,9],19],
"drag": [18,9,[13,15,16]],
"join": [10],
"id": [12,23],
"decis": [19],
"if": [13,23,17,12,9,0,20,10,19,[7,15,18,21],11,2,16,3,5,[1,4,6]],
"french": [13,[9,12],[15,20,23]],
"project_stats.txt": [19],
"non-ascii": [0],
"ocr": [23],
"projectaccesscurrenttargetdocumentmenuitem": [[0,5,6]],
"toolsvalidatetagsmenuitem": [[5,6]],
"in": [23,0,13,12,17,9,18,19,10,2,15,20,3,16,[5,6],4,[7,21],11,1,14],
"lower": [0,17,[4,5],[3,6,18,19,23]],
"termin": [13,20,9,[15,16]],
"ip": [[9,13,20]],
"index": [12,0,[13,15,16]],
"is": [13,0,23,9,12,[17,18],19,20,3,10,15,11,2,[5,16],[7,21],[4,6],1,14],
"it": [13,0,23,9,19,18,12,[3,17],15,10,[2,20],16,[1,11],[7,21],5,[4,6,14]],
"vertic": [3,0],
"whitelist": [[13,20]],
"decid": [[0,12,13,15,16]],
"projectaccesstmmenuitem": [0],
"odf": [[0,4,12,13]],
"smoother": [[0,23]],
"contrast": [0],
"ja": [[9,12,13,15,20]],
"becam": [[13,20]],
"begin": [3,0,[9,10]],
"odt": [[12,23]],
"gotonexttranslatedmenuitem": [[0,5,6]],
"viewmarktranslatedsegmentscheckboxmenuitem": [[0,5,6]],
"paragraph": [12,0,[4,10,23],[17,18],[13,14]],
"charset": [0],
"viewer": [18],
"valu": [12,0,23,13,[2,9,20],17],
"librari": [0,11],
"standalon": [[9,12]],
"ilia": [[9,13,20]],
"toolscheckissuescurrentfilemenuitem": [0],
"libraries.txt": [0],
"learned_words.txt": [19],
"language—th": [0],
"world": [13],
"meantim": [13],
"uxxxx": [12],
"ftl": [[9,12,13,20]],
"side": [[13,18],[0,23]],
"ftp": [12],
"break": [[0,12],4,3,[7,21,23]],
"editselectfuzzy1menuitem": [[0,5,6]],
"themselv": [0,3,13,12],
"upgrad": [9,[13,15,16],[12,14,23]],
"viewdisplaymodificationinfoallradiobuttonmenuitem": [[0,5,6]],
"tabular": [12],
"draw": [12],
"characters—known": [0],
"off": [17,[0,23]],
"comfort": [[9,13,15,16,23]],
"hide": [23,12],
"extran": [[0,3,12,23]],
"la": [12],
"report": [13,[0,10,11,20]],
"li": [[0,3]],
"dswing.aatext": [9],
"autocompleterlistpagedown": [[0,6]],
"ll": [13,[9,20]],
"auto": [19,12,17,[13,23]],
"receiv": [9,[12,18]],
"un-com": [9],
"sign": [0,3,[2,9,18]],
"lu": [[0,3]],
"document.xx.docx": [12],
"editorskipnexttokenwithselect": [[0,6]],
"while": [0,[10,17,23],[12,13,18],[2,4,7,11,20,21]],
"second": [[12,17],[0,2,3,5,9,18,23]],
"that": [13,0,23,12,3,10,19,9,17,20,18,15,16,[7,21],[4,5],[1,2,6,14]],
"cycleswitchcasemenuitem": [[0,5,6]],
"download": [13,9,[15,16],[0,5,6,12],[1,7,17,19,20,21,23]],
"split": [23,0,[3,4,10,12,17,18]],
"mb": [9,[13,20]],
"editortoggleovertyp": [[0,6]],
"mc": [3],
"oracl": [9,5,12],
"than": [[0,12],[9,13,19],[3,23],[7,10,11,18,20,21]],
"limit": [13,12,0,[4,9,10,19]],
"me": [13,3],
"non-translat": [12],
"picker": [[13,20]],
"omegat.png": [[9,15]],
"gradlew": [[13,15,16],9],
"administr": [13,12],
"mm": [13],
"entri": [23,0,[2,17],[12,18],[5,6],[9,10,19]],
"applicaton": [0],
"mn": [3],
"level": [23,10],
"ms": [[0,4]],
"author": [23,[10,17]],
"toggl": [13,[0,6],23],
"mt": [19,13],
"my": [[0,13],9],
"modif": [0,[12,13],6,10,[5,18,23],[11,17,19]],
"cascad": [12],
"plus": [[0,3]],
"disk": [23,13],
"viewmarklanguagecheckercheckboxmenuitem": [0],
"unseg": [10],
"updat": [13,[12,19],[0,23],[2,14,15,16,17]],
"ubiquit": [10],
"produc": [13,[0,4,12,18]],
"licenss": [0],
"no": [12,23,[0,9],[13,17],3,[2,15,16],[4,7,21],[1,10,19,20]],
"code": [0,6,5,13,[7,21],12,[9,15,16,20],23,14],
"bridg": [13,14,19],
"underscor": [0],
"gotohistoryforwardmenuitem": [[0,5,6]],
"box": [23,[0,4,12],[7,21]],
"switch": [0,[6,23],5,[13,17],[12,18]],
"head": [12],
"dialog": [12,23,17,[0,10,13],2,[7,21],[3,4,11,14,15,16,19]],
"project_save.tmx.timestamp.bak": [19],
"total": [18,[17,23]],
"immut": [19],
"of": [0,23,13,12,9,3,10,18,19,17,20,15,[7,21],5,[2,16],[6,11,14],4,1],
"bundl": [9,12,13,20,[15,16]],
"possibl": [13,[0,12],9,[3,18],[5,23]],
"involv": [[13,23],[7,9,19,21]],
"applicationif": [17],
"ok": [23,[15,17],[9,10]],
"dynam": [23],
"hear": [[0,3]],
"on": [13,9,0,23,12,20,17,18,[15,16],10,[3,6,14],4,[5,19],[7,21],[1,2]],
"keyboard": [0,[5,6,17,18]],
"macro": [23],
"technic": [0,[3,4,13,17]],
"purpos": [[0,12,13,23],[3,9,15,16,20]],
"or": [0,23,13,3,12,17,10,18,9,19,4,5,[15,20],6,2,[7,16,21],1,14,11],
"os": [[0,2],[9,18]],
"src": [13,[15,16]],
"gigabyt": [[13,20]],
"control": [17,0,[5,13],6,[9,10,12,20]],
"encod": [12,2,0,[14,19,23]],
"no-team": [13,[9,20]],
"comprehens": [10],
"editinserttranslationmenuitem": [[0,5,6]],
"extrem": [[0,3],[10,13]],
"pc": [[3,9]],
"lissens": [0],
"offici": [[0,3,14]],
"easier": [[0,13],[5,6,11]],
"compliant": [13],
"pm": [18],
"po": [12,13,[9,18,19,20]],
"closest": [12],
"optionsglossarystemmingcheckboxmenuitem": [[5,6]],
"pt": [9],
"upper": [17,5,[0,3,6]],
"ssh": [13],
"environ": [[13,15],16,9,[0,6,20]],
"qa": [23],
"autocompletertablefirst": [[0,6]],
"optionsautocompleteglossarymenuitem": [[5,6]],
"specialti": [13],
"necessari": [13,9,12,[0,1,3,7,10,15,16,21,23]],
"vari": [0,[5,6,11,13,15,20]],
"friend": [0],
"concurr": [17],
"recent": [17,13,[0,5,6,9,18]],
"they": [[0,23],[12,13],[18,19],[5,10],[2,6,7,9,21],[3,11,15,16,17]],
"pinpoint": [23,13],
"streamlin": [0],
"github": [13],
"edit": [23,18,[12,13],[15,17],0,[5,16],[9,14],[2,6,10,20],[7,11,21]],
"old": [13,10,[9,12,15,16,23]],
"subtract": [19],
"editselectfuzzy5menuitem": [[0,5,6]],
"them": [13,[0,10],23,12,17,18,[2,3,19],[4,6],[5,7,9,21]],
"bilingu": [[19,23],13],
"then": [13,9,[0,7,21],[10,23],[2,5,11,12,15,17,18,19,20]],
"kde": [[9,15],[13,20]],
"accept": [23,[13,19],[5,6,9,12,20]],
"third-parti": [13,14],
"rc": [[9,13,20]],
"includ": [13,0,23,12,[18,19],[3,15],[9,10,20],[11,16],17],
"readili": [13],
"adopt": [[0,5,6,10]],
"privaci": [9],
"t0": [10],
"t1": [10],
"t2": [10],
"t3": [10],
"minut": [13,12,[5,6,10,15,17,19]],
"access": [0,13,23,5,6,[12,17],10,[9,19],[1,11,20],[4,15,16]],
"currenc": [[0,23],3],
"languag": [13,12,23,9,[7,21],20,19,[0,14],[3,15],17,[16,18],[1,4,10]],
"seen": [3,0],
"seem": [[11,13]],
"sc": [[0,3]],
"exept": [13],
"current": [17,23,0,18,13,[11,19],[5,6],[2,12,15,16],9,[4,10]],
"sl": [[13,20]],
"optionsglossaryfuzzymatchingcheckboxmenuitem": [0],
"persist": [11],
"yandex.com": [12],
"so": [0,13,18,9,[15,16,19,23],[4,5,10,12,17,20]],
"caution": [[0,23]],
"email": [0],
"key": [5,0,23,6,9,12,18,13,[17,20],[2,14]],
"apart": [23],
"communic": [18],
"impract": [9],
"intern": [13,[0,11,12,18]],
"starter": [12],
"onc": [[13,23],9,[10,15],[0,16],[5,6,12,20]],
"svg": [[9,15]],
"one": [0,23,17,13,3,[12,18],[6,10],[9,19,20],[2,5,15],[1,11,16]],
"anymor": [13],
"msgid": [12],
"launch": [9,13,20,15,23,[0,12],[16,17],[4,11,14]],
"svn": [13,23,19],
"store": [0,13,[10,12,23],[11,18],[9,19],[2,15,16,17],[4,7,14,21]],
"interv": [12,13,[17,19]],
"omegat-license.txt": [0],
"editoverwritesourcemenuitem": [[0,5,6]],
"stori": [0],
"closer": [12],
"confirm": [6,[0,12,15,17,19,23],[5,9,13]],
"omegat.autotext": [[0,11]],
"characterss": [3],
"emerg": [13],
"kilobyt": [[13,20]],
"problemat": [10],
"enforc": [19,[10,12,13]],
"th": [17],
"bug": [[0,11,17]],
"remov": [23,12,13,19,15,[9,20],[0,7,16,17,21],[3,5,6]],
"tl": [[13,20]],
"tm": [19,13,12,23,17,[14,18],[9,10,20]],
"assist": [[10,18]],
"to": [13,23,0,12,9,17,10,15,18,20,19,6,3,16,5,2,[7,21],11,4,[1,14],22],
"v2": [13,[9,12]],
"v3": [13],
"typic": [20,[0,9,13]],
"editreplaceinprojectmenuitem": [[0,5,6]],
"but": [0,13,23,3,10,[12,15,19],[16,17],[2,9],[4,7,20,21]],
"symbol": [0,3,18],
"document.xx": [12],
"tw": [9],
"editordeletenexttoken": [[0,6]],
"contextu": [6],
"express": [0,3,23,12,14,[4,13,20],2,[5,7,9,10]],
"multilingu": [0],
"viewmarkautopopulatedcheckboxmenuitem": [[0,5,6]],
"zero": [0,23,[3,12]],
"projectwikiimportmenuitem": [[0,5,6]],
"deactiv": [[2,17]],
"countri": [9,[13,20],15,12],
"subsequ": [[0,4,9,12]],
"variant": [[12,13,20]],
"up": [0,13,[6,23],[11,19],9,12,[2,8,10,14,18,22]],
"written": [13,[17,23]],
"us": [0],
"gotoprevioussegmentmenuitem": [[0,5,6]],
"partway": [[13,23]],
"newword": [23],
"usual": [[9,13],17],
"this": [23,12,13,0,9,17,19,11,20,15,16,3,[10,18],[7,21],2,[4,5],6,14],
"gotopreviousnotemenuitem": [[0,5,6]],
"editredomenuitem": [[0,5,6]],
"uilayout.xml": [[0,11,19]],
"verif": [12],
"substitut": [17],
"opt": [15,13,16,0,20],
"extract": [23,[0,1,4,12,19]],
"vi": [9],
"brazilian": [[7,9,21]],
"hint": [7,13],
"know": [9,12,[0,3,20]],
"projectʼ": [10],
"region": [12,[13,20]],
"support": [13,23,10,[0,12,19],[3,9,20],[14,15,16,17]],
"vs": [12],
"sinc": [0,9,13,[3,10,23]],
"higher": [12,[0,4]],
"changed": [12],
"drop": [18,9,[13,15,16,19]],
"idea": [[13,23]],
"pure": [13],
"we": [[0,5,6],[3,10,13]],
"unchang": [0],
"auto-text": [[5,6]],
"rearrang": [17],
"wavy-lin": [12],
"autocompleterlistup": [[0,6]],
"licenc": [0],
"repo_for_omegat_team_project": [13],
"choic": [[9,23],[12,13,15,20]],
"normal": [9,0,[13,23],3,[17,19]],
"gradual": [[0,13,19]],
"adoptium.net": [[13,15,16]],
"slight": [[0,5,6,18]],
"corrupt": [11],
"previous": [0,17,6,[5,10,18],[12,13],[4,19,20,23]],
"projectaccessexporttmmenuitem": [0],
"wide": [13],
"licens": [13,0,[15,16],[1,3,9,17]],
"emac": [9],
"org": [13],
"distribut": [23,[9,13],[0,15],16,[14,20]],
"behav": [13,[0,11,14]],
"xf": [9],
"daunt": [[0,3]],
"example.email.org": [0],
"xx": [9,12],
"runtim": [[13,15],16,9,20,[0,6]],
"sourc": [13,12,23,17,0,19,18,10,[5,6,9],20,[2,4],15,[11,14,16],3],
"individu": [0,[3,23],13],
"reach": [0,13],
"realiz": [[0,7,21]],
"none": [12,23,[0,5,6,17,19]],
"ressourc": [23,3],
"type": [13,23,9,[18,20],[0,12,15],[10,14,16,19],[4,5,6,17]],
"beyond": [[0,3,9,10,18]],
"toolssinglevalidatetagsmenuitem": [[5,6]],
"problem": [[2,13],[9,11,17,18]],
"review": [10,[13,23],[0,14,18,19]],
"filenam": [12,23,[0,13,18]],
"optionsautocompletehistorypredictionmenuitem": [0],
"routin": [9],
"projectaccesssourcemenuitem": [[0,5,6]],
"roam": [[0,11]],
"between": [13,[0,3,18],12,23,17,[2,5,10,15,16]],
"yy": [12],
"nbsp": [23],
"method": [9,13,[5,15,18,20,23]],
"contract": [0],
"scroll": [[0,12,18]],
"gotosegmentmenuitem": [[0,5,6]],
"come": [0,13,19,15,[18,20],[10,16,23]],
"push": [13],
"exist": [13,15,[9,16,17,23],2,[10,12],[0,18,19]],
"readme_tr.txt": [13],
"penalti": [19,12],
"exact": [23,[0,3],[2,12,17],[7,10,19,21]],
"regist": [13,12,17,[0,5,6,18,23]],
"initialcreationd": [12],
"references—in": [0],
"sign-in": [9],
"flag": [12,17,0,[3,10,18]],
"spacebar": [0],
"utf8": [[0,2],[17,23]],
"helpaboutmenuitem": [[0,5,6]],
"copi": [13,23,[7,18,21],[12,17],[0,9,15,19],[5,6,11],[10,16]],
"out": [23,[0,3,17],[9,10,13]],
"weak": [23],
"induc": [13],
"get": [13,0,[3,15,16,20]],
"dark": [12],
"statist": [17,19,23,[5,12],[0,6,13],20],
"power": [[0,23],3,12],
"place": [[0,23],13,[10,15,16,17,19],[2,7,9,12,21]],
"packag": [13,15,9,16,20,17],
"accur": [[19,23]],
"leav": [12,10,[17,18,19],13],
"regular": [0,3,13,23,12,[4,20],[2,14,19],[5,7,9,10,18]],
"context_menu": [[0,6]],
"editsearchdictionarymenuitem": [0],
"restart": [[0,13],17,[5,6,11,12]],
"tag-valid": [[9,13,20]],
"generali": [3],
"ovr": [18],
"suggest": [18,12,[0,5,6,7,21]],
"alway": [12,[5,13,19],[0,6,17],[2,10,11,23]],
"lead": [12],
"token": [[0,6],[12,13,23],[18,19,20]],
"filter": [12,13,23,17,[0,10],[9,11,14,20],[5,6,19]],
"help": [0,13,[5,10],[14,17,20],[3,6,11,23]],
"expect": [12,13,[0,2,9,14,15]],
"site": [0,[13,15],[3,12,16],[6,10]],
"right-to-left": [[0,17],13],
"omegat.log": [[0,11]],
"behaviour": [[9,20]],
"carriag": [0,3],
"revis": [[0,13],1],
"repositori": [13,19,[14,17,18,23],[0,9,11,12,15,16]],
"shorcut": [2],
"minimum": [19,[0,3,12]],
"autocompletertableright": [[0,6]],
"date": [[0,10,12,23],19],
"magic": [0],
"argument": [9],
"data": [13,17,[12,23],20,[9,10,19]],
"lowercasemenuitem": [[0,5,6]],
"own": [13,0,23,3,[14,18]],
"wiki": [[1,13,19]],
"firefox": [[7,21]],
"autocompleterconfirmwithoutclos": [[0,6]],
"separ": [[0,12],[13,23],[10,18],[2,3],[4,5,6,15,16,17,19,20]],
"breakabl": [10],
"tab": [0,6,3,17,[5,12,18],2,4],
"filepath": [12],
"plain": [2,[0,3,13,23]],
"should": [0,12,13,[3,23],[5,6],[1,10,15,19],[9,11,16,17,20]],
"tag": [12,13,17,23,10,0,3,[5,6],[9,20],[14,18],4],
"replac": [23,0,17,[12,13],20,[5,6,10,11,18],3,[14,19]],
"agress": [0],
"versa": [23,13],
"tap": [0],
"sens": [[7,21]],
"tar": [9],
"like": [10,9,[13,23],[0,19],[1,3,18]],
"maxim": [18],
"onli": [0,12,23,13,[9,17],3,[10,18,20],[2,6],[1,4,5,7,11,19,21]],
"brace": [0,3],
"sent": [[12,20]],
"projectreloadmenuitem": [[0,5,6]],
"core": [19],
"person": [23,13],
"safe": [13],
"openoffic": [[7,21]],
"navig": [9,0,[15,17],[7,10,18,21]],
"send": [13,12],
"here": [12,18,13,[0,3,9,19,23],[10,15,16,17,20]],
"note": [13,0,23,17,18,10,12,9,[6,15,20],16,[3,5,7,11,19,21],4,[1,14]],
"cross-platform": [[9,13,15,16]],
"optionsautocompletechartablemenuitem": [[5,6]],
"line": [0,9,13,[3,20],15,12,[4,23],[5,18],[6,11],[2,14,16,19]],
"noth": [[3,10,17]],
"link": [12,[0,1,9,18,19]],
"hero": [0],
"becom": [3,[10,19]],
"provis": [13],
"tbx": [[0,2],[5,6,12]],
"wildcard": [[13,23]],
"can": [13,23,0,9,12,15,10,[18,19],20,17,2,16,3,[7,21],6,[4,5],11,1],
"everybodi": [13],
"contributor": [[0,23]],
"git": [13,19,[9,15,16]],
"satisfi": [[13,23]],
"cat": [[0,10,13,23]],
"duser.countri": [9,[13,20],15],
"provid": [13,12,0,15,[16,23],18,[9,11],[3,4,7,17,20,21]],
"realli": [17,23],
"smooth": [0],
"xx-yy": [12],
"reboot": [13],
"readm": [[9,12]],
"will": [23,[12,13],9,0,17,19,15,10,[16,18],[7,20,21],[2,5],[3,4],6,11],
"readi": [13,16],
"self-host": [13],
"match": [0,12,23,17,[3,19],18,[5,6],[2,13],10,4,14,[7,21]],
"follow": [0,13,3,23,[5,9,12],[6,15],4,[16,18,20],10,[1,7,17,19,21]],
"categori": [0,3,[4,14]],
"intent": [[0,4]],
"optionsspellcheckmenuitem": [[5,6]],
"fragment": [3,0,10],
"align.tmx": [[9,13,20]],
"file2": [13],
"arbitrari": [13],
"optionssetupfilefiltersmenuitem": [[0,5,6]],
"intend": [[0,3,12,13,19]],
"wild": [23,12]
};
