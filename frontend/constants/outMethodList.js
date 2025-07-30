import bowledOutImg from "../assets/bowled_out.png";
import runOutImg from "../assets/run_out.png";
import caughtOutImg from "../assets/caught_out.png";
import caughtBehindOutImg from "../assets/caught_behind_out.png";
import caughtAndBowledOutImg from "../assets/caught_and_bowled_out.png";
import lbwOutImg from "../assets/lbw_out.png";
import stumpedOutImg from "../assets/stumped_out.png";
import retiredHurtOutImg from "../assets/retired_hurt_out.png";
import retiredOutImg from "../assets/retired_out.png";
import hitWicketOutImg from "../assets/hit_wicket_out.png";


export const outMethodList = [{
  name: "bowled",
  img: bowledOutImg,
  payload: {
    runs: 0,
    isWide: false,
    isNoball: false,
    isBye: false,
    isLegBye: false,
    isWicket: true,

    isDeadBall: false,
    outMethod: "bowled"
  }
},
  {
    name: "caught",
    img: caughtOutImg,
    payload: {
      runs: 0,
      isWide: false,
      isNoball: false,
      isBye: false,
      isLegBye: false,
      isWicket: true,
      isDeadBall: false,
      outMethod: "caught"
    }
  },
  {
    name: "caught behind",
    img: caughtBehindOutImg,
    payload: {
      runs: 0,
      isWide: false,
      isNoball: false,
      isBye: false,
      isLegBye: false,
      isWicket: true,
      isDeadBall: false,
      outMethod: "caught behind"
    }
  },
  {
    name: "caught & bowled",
    img: caughtAndBowledOutImg,
    payload: {
      runs: 0,
      isWide: false,
      isNoball: false,
      isBye: false,
      isLegBye: false,
      isWicket: true,
      isDeadBall: false,
      outMethod: "caught & bowled"
    }
  },
  {
    name: "run out",
    img: runOutImg,
    payload: {
      runs: 0,
      isWide: false,
      isNoball: false,
      isBye: false,
      isLegBye: false,
      isWicket: true,
      isDeadBall: false,
      outMethod: "run out"
    }
  },
  {
    name: "lbw",
    img: lbwOutImg,
    payload: {
      runs: 0,
      isWide: false,
      isNoball: false,
      isBye: false,
      isLegBye: false,
      isWicket: true,
      isDeadBall: false,
      outMethod: "lbw"
    }
  },
  {
    name: "stumped",
    img: stumpedOutImg,
    payload: {
      runs: 0,
      isWide: false,
      isNoball: false,
      isBye: false,
      isLegBye: false,
      isWicket: true,
      isDeadBall: false,
      outMethod: "stumped"
    }
  },
  {
    name: "retired hurt",
    img: retiredHurtOutImg,
    payload: {
      runs: 0,
      isWide: false,
      isNoball: false,
      isBye: false,
      isLegBye: false,
      isWicket: true,
      isDeadBall: false,
      outMethod: "retired hurt"
    }
  },
  {
    name: "retired out",
    img: retiredOutImg,
    payload: {
      runs: 0,
      isWide: false,
      isNoball: false,
      isBye: false,
      isLegBye: false,
      isWicket: true,
      isDeadBall: false,
      outMethod: "retired out"
    }},
  {
    name: "hit wicket",
    img: hitWicketOutImg,
    payload: {
      runs: 0,
      isWide: false,
      isNoball: false,
      isBye: false,
      isLegBye: false,
      isWicket: true,
      isDeadBall: false,
      outMethod: "hit wicket"
    }
  }];