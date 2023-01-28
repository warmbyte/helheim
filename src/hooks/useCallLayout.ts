import { useMemo } from "react";

// https://stackoverflow.com/a/72677528
// compute how far an aspect ratio is from square
function aspectError(w:number,h:number) {
  return Math.abs(Math.log(w) - Math.log(h));
}

// Calculate a pleasing division between two grids
// returns [average aspect error, division point]
function balance(
  numShort:number, // number of short rows/cols
  numLong:number,  // number of long rows/cols
  shortLen:number, // cells in short ones (long ones are +1)
  T:number, // transverse dimension
  L:number // lengthwise dimension
  ){
    // short aspect = div/numshort x L/shortLen
    // long aspect = (T-div)/numLong x L/(shortLen+1)
    // setting equal and solving gives
    // div/(T-div) = (shortLen+1)*numShort/(shortLen*numLong)
    let ratio = (shortLen+1)*numShort / (shortLen * numLong);
    // this point gives both grids the same aspect ratio
    let even =  T * ratio / (ratio+1);
    // Experimentally, this one is more pleaseing
    let div = T*numShort / (numShort + numLong);
    div = (div+even)/2;
    // calculate the average aspect error, plus a penalty for differing area
   
    let err = (
        aspectError(div/numShort,L/shortLen) + 
      aspectError((T-div)/numLong, L/(shortLen+1)) +
      2*aspectError((div/numShort)*(L/shortLen), ((T-div)/numLong)*(L/(shortLen+1)))
      )/2;
    return [err,div];
}

// compute a squarish subdivision
// returns a list of rectangular grids:
// [{x,y,w,h,xdivs,ydivs}]
function squarish(W:number,H:number,N:number)
{
    let xdivs=1
  let ydivs=1
  while(xdivs*ydivs < N) {
    let err1 = aspectError(W/xdivs, H/(ydivs+1));
    let err2 = aspectError(W/(xdivs+1), H/ydivs);
    if (err1 < err2) {
        ydivs+=1;
    } else {
        xdivs+=1;
    }
  }
  // number of rows/cols we have to shorten
  const D = xdivs*ydivs - N;
  if (D<=0) {
    return [{x: 0, y: 0, w: W, h: H, xdivs, ydivs}];
  }
  // decide whether to shorten rows or columns.
  // try both
  let bestCase = null;
  let bestErr = Number.MAX_VALUE;
  if (ydivs == D && xdivs > 1) {
    let err = aspectError(W/(xdivs-1), H/ydivs);
    if (err < bestErr) {
        bestErr = err;
      bestCase = [{x: 0, y: 0, w: W, h: H, xdivs: xdivs-1, ydivs}];
    }
  } else if (ydivs > D && xdivs > 1) {
    // shorten D rows
    // calculate the division point between short and long rows
    // that gives all cells the same aspect
    let [err,div] = balance(D, ydivs-D, xdivs-1, H, W);
    if (err < bestErr) {
        bestErr = err;
      bestCase = [
        {x: 0, y: 0, w: W, h: div, xdivs: xdivs-1, ydivs: D},
        {x: 0, y: div, w: W, h: H-div, xdivs, ydivs: ydivs-D}
      ];
    }
    }
  if (xdivs == D && ydivs > 1) {
    let err = aspectError(W/xdivs, H/(ydivs-1));
    if (err < bestErr) {
        bestErr = err;
      bestCase = [{x: 0, y: 0, w: W, h: H, xdivs, ydivs: ydivs-1}];
    }
  } else if (xdivs > D && ydivs > 1) {
    // shorten D cols
    // calculate the division point between short and long cols
    // that gives all cells the same aspect
    let [err,div] = balance(D, xdivs-D, ydivs-1, W, H);
    if (err < bestErr) {
        bestErr = err;
      bestCase = [
        {x: 0, y: 0, w: div, h: H, xdivs: D, ydivs: ydivs-1},
        {x: div, y: 0, w: W-div, h: H, xdivs: xdivs-D, ydivs}
      ];
    }
    }
  return bestCase;
}

export const useCallLayout = (amount: number, dimensions: { width: number, height: number }) => {
  return useMemo(() => {
    const { width, height } = dimensions;
    const sq = squarish(Math.floor(width), Math.floor(height), amount) || [];
    const res = sq.reduce<{ width: number, height: number, left: number, top: number }[]>((acc, { x, y, w, h, xdivs, ydivs }) => {
      const xstep = w / xdivs;
      const ystep = h / ydivs;
      for (let i = 0; i < xdivs; i++) {
        for (let j = 0; j < ydivs; j++) {
          acc.push({
            left: x + i * xstep,
            top: y + j * ystep,
            width: xstep,
            height: ystep,
          });
        }
      }
      return acc;
    }, []);
    return res;
  }, [amount, dimensions.width, dimensions.height]);
};
