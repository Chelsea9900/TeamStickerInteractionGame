import { Collider, GameObject, Input, KeyCode, Physics, Resources, Time, Vector3 } from 'UnityEngine';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script';

import tsGameManager from './tsClientStarter';
import tsAudioManager from './tsAudioManager';
import { ZepetoPlayers } from 'ZEPETO.Character.Controller';
import { Button, Text } from 'UnityEngine.UI';

export default class tsCharacterCollision extends ZepetoScriptBehaviour {

    private GameManager = GameObject.Find("GameManager").GetComponent<tsGameManager>();
    private AudioManager = GameObject.Find("AudioManager").GetComponent<tsAudioManager>();
    private tpTime = 0;

    private effectStickerDisappear: GameObject;
    private freezeItemButton: Button;
    
    Start() {
        this.effectStickerDisappear = Resources.Load("effectStickerDisappear") as GameObject;
        this.freezeItemButton = GameObject.Find("Btn-FreezeItem").GetComponent<Button>();
        console.log("freezeItemButton : " + this.freezeItemButton);
        
        this.freezeItemButton.onClick.AddListener(() => {
            // add button click event
            if (!this.freezeItemButton.transform.GetChild(1).gameObject.activeSelf) {
                console.log('freezeItemButton onClick');

                let closePlayerSessionIDs = this.GetClosePlayerSessionIDs();
                console.log(closePlayerSessionIDs);

                let isBlue = this.GameManager.room.State.players.get_Item(this.GameManager.room.SessionId).isBlue;
                for (let i = 0; i < closePlayerSessionIDs.length; i++) {
                    if (this.GameManager.room.State.players.get_Item(closePlayerSessionIDs[i]).isBlue !== isBlue)
                        this.GameManager.SendFreezePlayer(closePlayerSessionIDs[i]);
                }
                this.GameManager.SendUsingItem(0);
            }
        });
    }

    private Update() {

        if (3 < this.tpTime && this.tpTime < 3.1) {
            ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.Teleport(new Vector3(-1.84, 1, -7.37), this.transform.rotation);
        } else if (-3.1 < this.tpTime && this.tpTime < -3) {
            ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.Teleport(new Vector3(56.02, 1, 24.51), this.transform.rotation);
        }

        if (this.freezeItemButton.transform.GetChild(1).gameObject.activeSelf && this.GameManager.room.State.players.get_Item(this.GameManager.room.SessionId).items.freezeItemCnt > 0)
            this.freezeItemButton.transform.GetChild(1).gameObject.SetActive(false);
        else if (!this.freezeItemButton.transform.GetChild(1).gameObject.activeSelf && this.GameManager.room.State.players.get_Item(this.GameManager.room.SessionId).items.freezeItemCnt <= 0)
            this.freezeItemButton.transform.GetChild(1).gameObject.SetActive(true);
        this.freezeItemButton.transform.GetChild(0).GetComponent<Text>().text = String(this.GameManager.room.State.players.get_Item(this.GameManager.room.SessionId).items.freezeItemCnt);
    }

    private OnTriggerEnter(other: Collider) {
        console.log(`OnTriggerEnter : ${other.name}`);

        if (other.name.includes("Sticker")) {
            this.takeSticker(other);
        } else if (other.name.includes("Post")) {
            this.updateScore(other);
        } else if (other.name.includes("TP")) {
            this.tpTime = 0;
        }
    }

    private OnTriggerStay(other: Collider) {
        // console.log(this.tpTime);
        if (other.name === "TPtoRedLamp") {
            this.tpTime += Time.deltaTime;
        } else if (other.name === "TPtoBlueLamp") {
            this.tpTime -= Time.deltaTime;
        }
    }

    private takeSticker(other: Collider) {
        // ???????????? ????????? ????????? ?????? ??????
        if (this.GameManager.room.State.players.get_Item(this.GameManager.room.SessionId).typeOfSticker != "")
            return;

        // ???????????? ?????? ???????????? ????????? ?????? ???????????? ?????? ?????? ??????
        if (other.name === "AngrySticker" || other.name === "GreatSticker" || other.name === "SmileSticker")
            return;

        // ?????? ?????? ???????????? ???????????? ???????????? ?????? ?????? ?????? ???????????? ??????(????????? ??????)
        GameObject.Instantiate(this.effectStickerDisappear, this.gameObject.transform);
        this.GameManager.SendTypeOfSticker(this.GameManager.room.SessionId, other.name);
        this.GameManager.SendDeleteSticker(other.name);
        this.AudioManager.audioGetSticker();
        //this.ActiveSticker(other.name);
    }

    // ?????? ????????????
    private updateScore(other: Collider) {
        // ???????????? ????????? ?????? ????????? ?????? ??????
        let typeOfSticker = this.GameManager.room.State.players.get_Item(this.GameManager.room.SessionId).typeOfSticker;
        if (typeOfSticker === "" || typeOfSticker === null || typeOfSticker === undefined)
            return;

        // ????????? ?????? ????????? ?????? ??????
        let playerIsBlue = this.GameManager.room.State.players.get_Item(this.GameManager.room.SessionId).isBlue;
        if (playerIsBlue === null || playerIsBlue === undefined)
            return;

        // ?????? ?????? ???????????? ??????
        let postIsBlue : boolean;
        if (other.name === "CheckRedPost") {
            postIsBlue = false;
            console.log(`[looog] postIsBlue CheckRedPost = ${postIsBlue}`);

        } else if (other.name === "CheckBluePost") {
            postIsBlue = true;
            console.log(`[looog] postIsBlue CheckRedPost = ${postIsBlue}`);

        }

        // ?????? ???????????? ????????? ?????? ??????
        if (postIsBlue === undefined || postIsBlue === null )
            return;

        // ????????? ?????? ?????? ??????
        let score: number;
        if (playerIsBlue === postIsBlue) {
            if (typeOfSticker.includes("GreatSticker")) {
                score = 3;
            } else if (typeOfSticker.includes("SmileSticker")) {
                score = 1;
            }
        } else if (playerIsBlue !== postIsBlue){
            if (typeOfSticker.includes("AngrySticker")) {
            score = -3;
            }
        }
        // ????????? ???????????? ????????? ?????? ??????
        if (score === undefined)
            return;

        console.log(`Update playerIsBlue = ${playerIsBlue}, postIsBlue = ${postIsBlue}, score = ${score}`);

        // if (postIsBlue !== undefined && score !== undefined && playerIsBlue !== undefined) {
        this.AudioManager.audioPushSticker();
        GameObject.Instantiate(this.effectStickerDisappear, this.gameObject.transform);
        this.GameManager.SendTypeOfSticker(this.GameManager.room.SessionId, "");
        this.GameManager.SendUpdateScore(postIsBlue, score);
        // }


    }

    private GetClosePlayerSessionIDs() {
        let hitCollder = Physics.OverlapSphere(this.transform.position, 5);
        let playerSessionIDs: string[] = [];

        for (let i = 0; i < hitCollder.length; i++) {
            if (hitCollder[i].name.includes("ZepetoCharacter")) {
                //?????? ????????? ??????
                let parseName = hitCollder[i].name.split("_");
                playerSessionIDs.push(`${parseName[2]}_${parseName[3]}`);
            }
        }
        return playerSessionIDs;
    }

    // private ActiveSticker(typeOfSticker: string) {
    //     if (typeOfSticker.includes("AngrySticker")) {
    //         this.transform.GetChild(2).GetChild(0).gameObject.SetActive(true);
    //         this.transform.GetChild(2).GetChild(1).gameObject.SetActive(false);
    //         this.transform.GetChild(2).GetChild(2).gameObject.SetActive(false);
    //     } else if (typeOfSticker.includes("GreatSticker")) {
    //         this.transform.GetChild(2).GetChild(0).gameObject.SetActive(false);
    //         this.transform.GetChild(2).GetChild(1).gameObject.SetActive(true);
    //         this.transform.GetChild(2).GetChild(2).gameObject.SetActive(false);
    //     } else if (typeOfSticker.includes("SmileSticker")) {
    //         this.transform.GetChild(2).GetChild(0).gameObject.SetActive(false);
    //         this.transform.GetChild(2).GetChild(1).gameObject.SetActive(false);
    //         this.transform.GetChild(2).GetChild(2).gameObject.SetActive(true);
    //     } else if (typeOfSticker === "") {
    //         this.transform.GetChild(2).GetChild(0).gameObject.SetActive(false);
    //         this.transform.GetChild(2).GetChild(1).gameObject.SetActive(false);
    //         this.transform.GetChild(2).GetChild(2).gameObject.SetActive(false);
    //     }
    // }



}
