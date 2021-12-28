import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import * as UnityEngine from "UnityEngine";

export default class tsUIManager extends ZepetoScriptBehaviour {

    public imgReady: UnityEngine.GameObject;
    public imgOne: UnityEngine.GameObject;
    public imgTwo: UnityEngine.GameObject;
    public imgThree: UnityEngine.GameObject;
    public imgStart: UnityEngine.GameObject;
    public imgFinish: UnityEngine.GameObject;

    public imgWin: UnityEngine.GameObject;
    public imgLose: UnityEngine.GameObject;
    public imgDraw: UnityEngine.GameObject;

    public * CreatReady() {
        // Ready?
        this.imgReady.SetActive(true);
        yield new UnityEngine.WaitForSeconds(2);
        this.imgReady.SetActive(false);
    }
    public * CreatOne() {
        this.imgOne.SetActive(true);
        yield new UnityEngine.WaitForSeconds(1);
        this.imgOne.SetActive(false);
    }
    public * CreatTwo() {
        this.imgTwo.SetActive(true);
        yield new UnityEngine.WaitForSeconds(1);
        this.imgTwo.SetActive(false);
    }
    public * CreatThree() {
        this.imgThree.SetActive(true);
        yield new UnityEngine.WaitForSeconds(1);
        this.imgThree.SetActive(false);
    }
    public * CreatStart() {
        this.imgStart.SetActive(true);
        yield new UnityEngine.WaitForSeconds(1);
        this.imgStart.SetActive(false);
    }
    public CreatFinish() {
        this.imgFinish.SetActive(true);
    }
    public CreatWin() {
        this.imgWin.SetActive(true);
    }

    public CreatLose() {
        this.imgLose.SetActive(true);
    }

    public CreatDraw() {
        this.imgDraw.SetActive(true);
    }
}