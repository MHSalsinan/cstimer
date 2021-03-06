/*

scramble_333.js

3x3x3 Solver / Scramble Generator in Javascript.

The core 3x3x3 code is from a min2phase solver by Shuang Chen.
Compiled to Javascript using GWT.
(There may be a lot of redundant code right now, but it's still really fast.)

 */
"use strict";

var scramble_333 = (function(getNPerm, get8Perm, setNPerm, set8Perm, getNParity, getPruning, Cnk, fact, rn, rndEl) {

	var Ux1 = 0,
		Ux2 = 1,
		Ux3 = 2,
		Rx1 = 3,
		Rx2 = 4,
		Rx3 = 5,
		Fx1 = 6,
		Fx2 = 7,
		Fx3 = 8,
		Dx1 = 9,
		Dx2 = 10,
		Dx3 = 11,
		Lx1 = 12,
		Lx2 = 13,
		Lx3 = 14,
		Bx1 = 15,
		Bx2 = 16,
		Bx3 = 17;

	function CubieCube_$$init(obj) {
		obj.cp = [0, 1, 2, 3, 4, 5, 6, 7];
		obj.co = [0, 0, 0, 0, 0, 0, 0, 0];
		obj.ep = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
		obj.eo = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	}

	function $setFlip(obj, idx) {
		var i, parity;
		parity = 0;
		for (i = 10; i >= 0; --i) {
			parity ^= obj.eo[i] = (idx & 1);
			idx >>= 1;
		}
		obj.eo[11] = parity;
	}

	function $setTwist(obj, idx) {
		var i, twst;
		twst = 0;
		for (i = 6; i >= 0; --i) {
			twst += obj.co[i] = idx % 3;
			idx = ~~(idx / 3);
		}
		obj.co[7] = (15 - twst) % 3;
	}

	function CornMult(a, b, prod) {
		var corn, ori, oriA, oriB;
		for (corn = 0; corn < 8; ++corn) {
			prod.cp[corn] = a.cp[b.cp[corn]];
			oriA = a.co[b.cp[corn]];
			oriB = b.co[corn];
			ori = oriA;
			ori += oriA < 3 ? oriB : 6 - oriB;
			ori %= 3;
			((oriA >= 3) !== (oriB >= 3)) && (ori += 3);
			prod.co[corn] = ori;
		}
	}

	function CubieCube() {
		CubieCube_$$init(this);
	}

	function CubieCube1(cperm, twist, eperm, flip) {
		CubieCube_$$init(this);
		set8Perm(this.cp, cperm);
		$setTwist(this, twist);
		setNPerm(this.ep, eperm, 12);
		$setFlip(this, flip);
	}

	function EdgeMult(a, b, prod) {
		var ed;
		for (ed = 0; ed < 12; ++ed) {
			prod.ep[ed] = a.ep[b.ep[ed]];
			prod.eo[ed] = b.eo[ed] ^ a.eo[b.ep[ed]];
		}
	}

	function initMove() {
		var a, p;
		moveCube[0] = new CubieCube1(15120, 0, 119750400, 0);
		moveCube[3] = new CubieCube1(21021, 1494, 323403417, 0);
		moveCube[6] = new CubieCube1(8064, 1236, 29441808, 550);
		moveCube[9] = new CubieCube1(9, 0, 5880, 0);
		moveCube[12] = new CubieCube1(1230, 412, 2949660, 0);
		moveCube[15] = new CubieCube1(224, 137, 328552, 137);
		for (a = 0; a < 18; a += 3) {
			for (p = 0; p < 2; ++p) {
				moveCube[a + p + 1] = new CubieCube;
				EdgeMult(moveCube[a + p], moveCube[a], moveCube[a + p + 1]);
				CornMult(moveCube[a + p], moveCube[a], moveCube[a + p + 1]);
			}
		}
	}

	var _ = CubieCube1.prototype = CubieCube.prototype;
	var moveCube = [];
	var cornerFacelet = [
		[8, 9, 20],
		[6, 18, 38],
		[0, 36, 47],
		[2, 45, 11],
		[29, 26, 15],
		[27, 44, 24],
		[33, 53, 42],
		[35, 17, 51]
	];
	var edgeFacelet = [
		[5, 10],
		[7, 19],
		[3, 37],
		[1, 46],
		[32, 16],
		[28, 25],
		[30, 43],
		[34, 52],
		[23, 12],
		[21, 41],
		[50, 39],
		[48, 14]
	];

	function toCubieCube(f, ccRet) {
		var col1, col2, i, j, ori;
		for (i = 0; i < 8; ++i)
			ccRet.cp[i] = 0;
		for (i = 0; i < 12; ++i)
			ccRet.ep[i] = 0;
		for (i = 0; i < 8; ++i) {
			for (ori = 0; ori < 3; ++ori)
				if (f[cornerFacelet[i][ori]] == 0 || f[cornerFacelet[i][ori]] == 3)
					break;
			col1 = f[cornerFacelet[i][(ori + 1) % 3]];
			col2 = f[cornerFacelet[i][(ori + 2) % 3]];
			for (j = 0; j < 8; ++j) {
				if (col1 == ~~(cornerFacelet[j][1] / 9) && col2 == ~~(cornerFacelet[j][2] / 9)) {
					ccRet.cp[i] = j;
					ccRet.co[i] = ori % 3;
					break;
				}
			}
		}
		for (i = 0; i < 12; ++i) {
			for (j = 0; j < 12; ++j) {
				if (f[edgeFacelet[i][0]] == ~~(edgeFacelet[j][0] / 9) && f[edgeFacelet[i][1]] == ~~(edgeFacelet[j][1] / 9)) {
					ccRet.ep[i] = j;
					ccRet.eo[i] = 0;
					break;
				}
				if (f[edgeFacelet[i][0]] == ~~(edgeFacelet[j][1] / 9) && f[edgeFacelet[i][1]] == ~~(edgeFacelet[j][0] / 9)) {
					ccRet.ep[i] = j;
					ccRet.eo[i] = 1;
					break;
				}
			}
		}
	}

	function toFaceCube(cc) {
		var c, e, f, i, j, n, ori, ts;
		f = [];
		ts = [85, 82, 70, 68, 76, 66];
		for (i = 0; i < 54; ++i) {
			f[i] = ts[~~(i / 9)];
		}
		for (c = 0; c < 8; ++c) {
			j = cc.cp[c];
			ori = cc.co[c];
			for (n = 0; n < 3; ++n)
				f[cornerFacelet[c][(n + ori) % 3]] = ts[~~(cornerFacelet[j][n] / 9)];
		}
		for (e = 0; e < 12; ++e) {
			j = cc.ep[e];
			ori = cc.eo[e];
			for (n = 0; n < 2; ++n)
				f[edgeFacelet[e][(n + ori) % 2]] = ts[~~(edgeFacelet[j][n] / 9)];
		}
		return String.fromCharCode.apply(null, f);
	}

	function initialize() {
		// var startTime = +new Date;
		initMove();
		initialized = true;
	}

	var initialized = false;

	function ini() {
		if (!initialized) {
			initialize()
			initialized = true;
		}
	}


	// SCRAMBLERS

	var search = new min2phase.Search();

	function getRandomOriScramble() {
		return getRandomScramble() + rndEl(["", "Rw ", "Rw2 ", "Rw' ", "Fw ", "Fw' "]) + rndEl(["", "Uw", "Uw2", "Uw'"]);
	}

	function getRandomScramble() {
		return getAnyScramble(0xffffffffffff, 0xffffffffffff, 0xffffffff, 0xffffffff);
	}

	function getFMCScramble() {
		var scramble = "",
			axis1, axis2, axisl1, axisl2;
		do {
			scramble = getAnyScramble(0xffffffffffff, 0xffffffffffff, 0xffffffff, 0xffffffff);
			var moveseq = scramble.split(' ');
			if (moveseq.length < 3) {
				continue;
			}
			axis1 = moveseq[0][0];
			axis2 = moveseq[1][0];
			axisl1 = moveseq[moveseq.length - 2][0];
			axisl2 = moveseq[moveseq.length - 3][0];
		} while (
			axis1 == 'F' || axis1 == 'B' && axis2 == 'F' ||
			axisl1 == 'R' || axisl1 == 'L' && axisl2 == 'R');
		return "R' U' F " + scramble + "R' U' F";
	}

	function cntU(b) {
		for (var c = 0, a = 0; a < b.length; a++) - 1 == b[a] && c++;
		return c
	}

	function fixOri(arr, cntU, base) {
		var sum = 0;
		var idx = 0;
		for (var i = 0; i < arr.length; i++) {
			if (arr[i] != -1) {
				sum += arr[i];
			}
		}
		sum %= base;
		for (var i = 0; i < arr.length - 1; i++) {
			if (arr[i] == -1) {
				if (cntU-- == 1) {
					arr[i] = ((base << 4) - sum) % base;
				} else {
					arr[i] = rn(base);
					sum += arr[i];
				}
			}
			idx *= base;
			idx += arr[i];
		}
		return idx;
	}

	function fixPerm(arr, cntU, parity) {
		var val = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
		for (var i = 0; i < arr.length; i++) {
			if (arr[i] != -1) {
				val[arr[i]] = -1;
			}
		}
		for (var i = 0, j = 0; i < val.length; i++) {
			if (val[i] != -1) {
				val[j++] = val[i];
			}
		}
		var last;
		for (var i = 0; i < arr.length && cntU > 0; i++) {
			if (arr[i] == -1) {
				var r = rn(cntU);
				arr[i] = val[r];
				for (var j = r; j < 11; j++) {
					val[j] = val[j + 1];
				}
				if (cntU-- == 2) {
					last = i;
				}
			}
		}
		if (getNParity(getNPerm(arr, arr.length), arr.length) == 1 - parity) {
			var temp = arr[i - 1];
			arr[i - 1] = arr[last];
			arr[last] = temp;
		}
		return getNPerm(arr, arr.length);
	}

	//arr: 53 bit integer
	function parseMask(arr, length) {
		if ('number' !== typeof arr) {
			return arr;
		}
		var ret = [];
		for (var i = 0; i < length; i++) {
			var val = arr & 0xf; // should use "/" instead of ">>" to avoid unexpected type conversion
			ret[i] = val == 15 ? -1 : val;
			arr /= 16;
		}
		return ret;
	}

	function getAnyScramble(_ep, _eo, _cp, _co, _rndapp, _rndpre) {
		ini();
		_rndapp = _rndapp || [
			[]
		];
		_rndpre = _rndpre || [
			[]
		];
		_ep = parseMask(_ep, 12);
		_eo = parseMask(_eo, 12);
		_cp = parseMask(_cp, 8);
		_co = parseMask(_co, 8);
		var solution = "";
		do {
			var eo = _eo.slice();
			var ep = _ep.slice();
			var co = _co.slice();
			var cp = _cp.slice();
			var neo = fixOri(eo, cntU(eo), 2);
			var nco = fixOri(co, cntU(co), 3);
			var nep, ncp;
			var ue = cntU(ep);
			var uc = cntU(cp);
			if (ue == 0 && uc == 0) {
				nep = getNPerm(ep, 12);
				ncp = getNPerm(cp, 8);
			} else if (ue != 0 && uc == 0) {
				ncp = getNPerm(cp, 8);
				nep = fixPerm(ep, ue, getNParity(ncp, 8));
			} else if (ue == 0 && uc != 0) {
				nep = getNPerm(ep, 12);
				ncp = fixPerm(cp, uc, getNParity(nep, 12));
			} else {
				nep = fixPerm(ep, ue, -1);
				ncp = fixPerm(cp, uc, getNParity(nep, 12));
			}
			if (ncp + nco + nep + neo == 0) {
				continue;
			}
			var cc = new CubieCube1(ncp, nco, nep, neo);
			var cc2 = new CubieCube;
			var rndpre = rndEl(_rndpre);
			var rndapp = rndEl(_rndapp);
			for (var i = 0; i < rndpre.length; i++) {
				CornMult(moveCube[rndpre[i]], cc, cc2);
				EdgeMult(moveCube[rndpre[i]], cc, cc2);
				var tmp = cc2;
				cc2 = cc;
				cc = tmp;
			}
			for (var i = 0; i < rndapp.length; i++) {
				CornMult(cc, moveCube[rndapp[i]], cc2);
				EdgeMult(cc, moveCube[rndapp[i]], cc2);
				var tmp = cc2;
				cc2 = cc;
				cc = tmp;
			}
			var posit = toFaceCube(cc);
			var search0 = new min2phase.Search();
			solution = search0.solution(posit, 21, 1e9, 50, 2);
		} while (solution.length <= 3);
		return solution.replace(/ +/g, ' ');
	}

	function getEdgeScramble() {
		return getAnyScramble(0xffffffffffff, 0xffffffffffff, 0x76543210, 0x00000000);
	}

	function getCornerScramble() {
		return getAnyScramble(0xba9876543210, 0x000000000000, 0xffffffff, 0xffffffff);
	}

	function getLLScramble() {
		return getAnyScramble(0xba987654ffff, 0x00000000ffff, 0x7654ffff, 0x0000ffff);
	}

	function getLSLLScramble() {
		return getAnyScramble(0xba9f7654ffff, 0x000f0000ffff, 0x765fffff, 0x000fffff);
	}

	function getF2LScramble() {
		return getAnyScramble(0xffff7654ffff, 0xffff0000ffff, 0xffffffff, 0xffffffff);
	}

	var zbll_map = [
		[0x3210, 0x2121], // H-BBFF
		[0x3012, 0x2121], // H-FBFB
		[0x3120, 0x2121], // H-RFLF
		[0x3201, 0x2121], // H-RLFF
		[0x3012, 0x1020], // L-FBRL
		[0x3021, 0x1020], // L-LBFF
		[0x3201, 0x1020], // L-LFFB
		[0x3102, 0x1020], // L-LFFR
		[0x3210, 0x1020], // L-LRFF
		[0x3120, 0x1020], // L-RFBL
		[0x3102, 0x1122], // Pi-BFFB
		[0x3120, 0x1122], // Pi-FBFB
		[0x3012, 0x1122], // Pi-FRFL
		[0x3021, 0x1122], // Pi-FRLF
		[0x3210, 0x1122], // Pi-LFRF
		[0x3201, 0x1122], // Pi-RFFL
		[0x3120, 0x2220], // S-FBBF
		[0x3102, 0x2220], // S-FBFB
		[0x3210, 0x2220], // S-FLFR
		[0x3201, 0x2220], // S-FLRF
		[0x3021, 0x2220], // S-LFFR
		[0x3012, 0x2220], // S-LFRF
		[0x3210, 0x2100], // T-BBFF
		[0x3012, 0x2100], // T-FBFB
		[0x3201, 0x2100], // T-FFLR
		[0x3120, 0x2100], // T-FLFR
		[0x3102, 0x2100], // T-RFLF
		[0x3021, 0x2100], // T-RLFF
		[0x3021, 0x1200], // U-BBFF
		[0x3201, 0x1200], // U-BFFB
		[0x3012, 0x1200], // U-FFLR
		[0x3120, 0x1200], // U-FRLF
		[0x3102, 0x1200], // U-LFFR
		[0x3210, 0x1200], // U-LRFF
		[0x3102, 0x1101], // aS-FBBF
		[0x3120, 0x1101], // aS-FBFB
		[0x3012, 0x1101], // aS-FRFL
		[0x3021, 0x1101], // aS-FRLF
		[0x3210, 0x1101], // aS-LFRF
		[0x3201, 0x1101], // aS-RFFL
		[0xffff, 0x0000] // PLL
	];

	var zbprobs = [1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3];

	var zbfilter = ['H-BBFF', 'H-FBFB', 'H-RFLF', 'H-RLFF', 'L-FBRL', 'L-LBFF', 'L-LFFB', 'L-LFFR', 'L-LRFF', 'L-RFBL', 'Pi-BFFB', 'Pi-FBFB', 'Pi-FRFL', 'Pi-FRLF', 'Pi-LFRF', 'Pi-RFFL', 'S-FBBF', 'S-FBFB', 'S-FLFR', 'S-FLRF', 'S-LFFR', 'S-LFRF', 'T-BBFF', 'T-FBFB', 'T-FFLR', 'T-FLFR', 'T-RFLF', 'T-RLFF', 'U-BBFF', 'U-BFFB', 'U-FFLR', 'U-FRLF', 'U-LFFR', 'U-LRFF', 'aS-FBBF', 'aS-FBFB', 'aS-FRFL', 'aS-FRLF', 'aS-LFRF', 'aS-RFFL', 'PLL'];

	function getZBLLScramble(type, length, cases) {
		var idx = cases;
		var zbcase = zbll_map[idx];
		return getAnyScramble(0xba987654ffff, 0, zbcase[0] + 0x76540000, zbcase[1], [
			[],
			[Ux1],
			[Ux2],
			[Ux3]
		], [
			[],
			[Ux1],
			[Ux2],
			[Ux3]
		]);
	}

	function getZZLLScramble() {
		return getAnyScramble(0xba9876543f1f, 0x000000000000, 0x7654ffff, 0x0000ffff, [
			[],
			[Ux1],
			[Ux2],
			[Ux3]
		]);
	}

	function getZBLSScramble() {
		return getAnyScramble(0xba9f7654ffff, 0x000000000000, 0x765fffff, 0x000fffff);
	}

	function getLSEScramble() {
		switch (rn(4)) {
			case 0:
				return getAnyScramble(0xba98f6f4ffff, 0x0000f0f0ffff, 0x76543210, 0x00000000);
			case 1:
				return getAnyScramble(0xba98f6f4ffff, 0x0000f0f0ffff, 0x76543210, 0x00000000, [
					[Rx1, Lx3]
				]) + "x'";
			case 2:
				return getAnyScramble(0xba98f6f4ffff, 0x0000f0f0ffff, 0x76543210, 0x00000000, [
					[Rx2, Lx2]
				]) + "x2";
			case 3:
				return getAnyScramble(0xba98f6f4ffff, 0x0000f0f0ffff, 0x76543210, 0x00000000, [
					[Rx3, Lx1]
				]) + "x";
		}
	}

	function getCMLLScramble() {
		switch (rn(4)) {
			case 0:
				return getAnyScramble(0xba98f6f4ffff, 0x0000f0f0ffff, 0x7654ffff, 0x0000ffff);
			case 1:
				return getAnyScramble(0xba98f6f4ffff, 0x0000f0f0ffff, 0x7654ffff, 0x0000ffff, [
					[Rx1, Lx3]
				]) + "x'";
			case 2:
				return getAnyScramble(0xba98f6f4ffff, 0x0000f0f0ffff, 0x7654ffff, 0x0000ffff, [
					[Rx2, Lx2]
				]) + "x2";
			case 3:
				return getAnyScramble(0xba98f6f4ffff, 0x0000f0f0ffff, 0x7654ffff, 0x0000ffff, [
					[Rx3, Lx1]
				]) + "x";
		}
	}

	function getCLLScramble() {
		return getAnyScramble(0xba9876543210, 0x000000000000, 0x7654ffff, 0x0000ffff);
	}

	function getELLScramble() {
		return getAnyScramble(0xba987654ffff, 0x00000000ffff, 0x76543210, 0x00000000);
	}

	function get2GLLScramble() {
		return getAnyScramble(0xba987654ffff, 0x000000000000, 0x76543210, 0x0000ffff, [
			[],
			[Ux1],
			[Ux2],
			[Ux3]
		]);
	}

	var pll_map = [
		[0x1032, 0x3210], // H
		[0x3102, 0x3210], // Ua
		[0x3021, 0x3210], // Ub
		[0x2301, 0x3210], // Z
		[0x3210, 0x3021], // Aa
		[0x3210, 0x3102], // Ab
		[0x3210, 0x2301], // E
		[0x3012, 0x3201], // F
		[0x2130, 0x3021], // Gb
		[0x1320, 0x3102], // Ga
		[0x3021, 0x3102], // Gc
		[0x3102, 0x3021], // Gd
		[0x3201, 0x3201], // Ja
		[0x3120, 0x3201], // Jb
		[0x1230, 0x3012], // Na
		[0x3012, 0x3012], // Nb
		[0x0213, 0x3201], // Ra
		[0x2310, 0x3201], // Rb
		[0x1230, 0x3201], // T
		[0x3120, 0x3012], // V
		[0x3201, 0x3012] // Y
	];

	var pllprobs = [
		1, 4, 4, 2,
		4, 4, 2, 4,
		4, 4, 4, 4,
		4, 4, 1, 1,
		4, 4, 4, 4, 4
	];

	var pllfilter = [
		'H', 'Ua', 'Ub', 'Z',
		'Aa', 'Ab', 'E', 'F',
		'Ga', 'Gb', 'Gc', 'Gd',
		'Ja', 'Jb', 'Na', 'Nb',
		'Ra', 'Rb', 'T', 'V', 'Y'
	];

	function getPLLScramble(type, length, cases) {
		var idx = cases;
		var pllcase = pll_map[idx];
		return getAnyScramble(pllcase[0] + 0xba9876540000, 0x000000000000, pllcase[1] + 0x76540000, 0x00000000, [
			[],
			[Ux1],
			[Ux2],
			[Ux3]
		], [
			[],
			[Ux1],
			[Ux2],
			[Ux3]
		]);
	}

	function getEOLineScramble() {
		return getAnyScramble(0xffff7f5fffff, 0x000000000000, 0xffffffff, 0xffffffff);
	}

	function getEasyCrossScramble(type, length) {
		var cases = cross.getEasyCross(length);
		return getAnyScramble(cases[0], cases[1], 0xffffffff, 0xffffffff);
	}

	function genFacelet(facelet) {
		return search.solution(facelet, 21, 1e9, 50, 2);
	}

	function solvFacelet(facelet) {
		return search.solution(facelet, 21, 1e9, 50, 0);
	}

	scramble.reg('333', getRandomScramble)
		('333fm', getFMCScramble)
		('333ni', getRandomOriScramble)
		('edges', getEdgeScramble)
		('corners', getCornerScramble)
		('ll', getLLScramble)
		('lsll2', getLSLLScramble)
		('f2l', getF2LScramble)
		('zbll', getZBLLScramble, [zbfilter, zbprobs])
		('zzll', getZZLLScramble)
		('zbls', getZBLSScramble)
		('lse', getLSEScramble)
		('cmll', getCMLLScramble)
		('cll', getCLLScramble)
		('ell', getELLScramble)
		('pll', getPLLScramble, [pllfilter, pllprobs])
		('2gll', get2GLLScramble)
		('easyc', getEasyCrossScramble)
		('eoline', getEOLineScramble);

	return {
		/* mark2 interface */
		getRandomScramble: getRandomScramble, //getRandomScramble,

		/* added methods */
		getEdgeScramble: getEdgeScramble,
		getCornerScramble: getCornerScramble,
		getLLScramble: getLLScramble,
		getLSLLScramble: getLSLLScramble,
		getZBLLScramble: getZBLLScramble,
		getZZLLScramble: getZZLLScramble,
		getF2LScramble: getF2LScramble,
		getLSEScramble: getLSEScramble,
		getCMLLScramble: getCMLLScramble,
		getCLLScramble: getCLLScramble,
		getELLScramble: getELLScramble,
		getAnyScramble: getAnyScramble,
		genFacelet: genFacelet,
		solvFacelet: solvFacelet
	};

})(mathlib.getNPerm, mathlib.get8Perm, mathlib.setNPerm, mathlib.set8Perm, mathlib.getNParity, mathlib.getPruning, mathlib.Cnk, mathlib.fact, mathlib.rn, mathlib.rndEl);