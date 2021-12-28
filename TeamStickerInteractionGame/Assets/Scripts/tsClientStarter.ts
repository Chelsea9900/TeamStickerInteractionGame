// 제페토 관련 임포트
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { ZepetoWorldMultiplay } from 'ZEPETO.World'
import {ZepetoWorldHelper} from 'ZEPETO.World'
import { Room, RoomData, RoomLeaveEvent, Room$1, RoomType } from 'ZEPETO.Multiplay'
import { Player, State, Vector3 } from 'ZEPETO.Multiplay.Schema'
import { CharacterState, SpawnInfo, ZepetoCharacter, ZepetoPlayer, ZepetoPlayerControl, ZepetoPlayers } from 'ZEPETO.Character.Controller'

// 유니티 관련 임포트
import * as UnityEngine from "UnityEngine";
import { Button, Text, Toggle, Image } from 'UnityEngine.UI';

import tsCharacterCollision from './tsCharacterCollision';
import tsStickerManager from './tsStickerManager';
import tsStickerAction from './tsStickerAction';
import tsUIManager from './tsUIManager'
import tsAudioManager from './tsAudioManager'

export default class extends ZepetoScriptBehaviour {
    public multiplay: ZepetoWorldMultiplay;
    public room: Room;

    private playTime: number = 188;
    private isStartGame: boolean = false;

    public textRoundTime: Text;
    public textScoreBlue: Text;
    public textScoreRed: Text;
    public stickers: UnityEngine.GameObject;

    // public blueTeamUniform: UnityEngine.GameObject;
    // public redTeamUniform: UnityEngine.GameObject;
    public roundBGM: UnityEngine.GameObject;

    private AudioManager = UnityEngine.GameObject.Find("AudioManager").GetComponent<tsAudioManager>();
    private UIManager = UnityEngine.GameObject.Find("Canvas").gameObject.transform.GetChild(1).GetComponent<tsUIManager>();
    private tsStickerManager = UnityEngine.GameObject.Find("StickerManager").GetComponent<tsStickerManager>();

    private effectHasSticker: UnityEngine.GameObject;
    private effectStickerAction: UnityEngine.GameObject;
    public awardBlue: UnityEngine.GameObject;
    public awardRed: UnityEngine.GameObject;
    public reactionWinBlue: UnityEngine.GameObject;
    public reactionWinRed: UnityEngine.GameObject;
    public reactionLoseBlue: UnityEngine.GameObject;
    public reactionLoseRed: UnityEngine.GameObject;

    public afterGameCamera : UnityEngine.GameObject;
    private blueTeam: string[] = []; // 서버가 broadcast 해준 blue 팀원들의 SID 들을 담을 것
    private redTeam: string[] = []; // 서버가 broadcast 해준 red 팀원들의 SID 들을 담을 것
    public myZepetoPlayers: UnityEngine.GameObject;
    public textJoinCntInfo: Text;
    public panelJoinCntInfo: UnityEngine.GameObject;
    public toggleInfo: Toggle;
    public panelToggleInfo: UnityEngine.GameObject;
    public Info: UnityEngine.GameObject;
    private freezeItemButton: Button;
    public teamUniforms: UnityEngine.GameObject;

        private Start() {
        
        this.freezeItemButton = UnityEngine.GameObject.Find("Btn-FreezeItem").GetComponent<Button>();

        this.toggleInfo.onValueChanged.AddListener((tOn: bool)=>{ //토글버튼 누를 때마다 변경된 tOn값이 전달됨
            if(tOn == true){
                console.log('[Log] toggleInfo tOn true (체크활성)');
                this.Info.gameObject.SetActive(true);
                tOn = false;
            }else if(tOn == false){
                console.log('[Log]toggleInfo tOn false (체크해제)');
                this.Info.gameObject.SetActive(false);
                tOn = true;
            }
        });

        this.multiplay.RoomCreated += (room: Room) => {
            this.playTime = 188;
            this.room = room;
            this.roundBGM.gameObject.SetActive(false);
            this.AudioManager.audioWaiting();         
        };

        this.multiplay.RoomJoined += (room: Room) => {
            room.OnStateChange += this.OnStateChange;

            room.AddMessageHandler("deleteSticker", (message) => {
                console.log(`[Log] Delete - ${message}, ${typeof (message)}`);
                this.tsStickerManager.DeleteStickerByName(String(message));
            });

            room.AddMessageHandler("dumpSticker", (message) => {
                console.log(`[Log] 튀어나올 스티커는 ${String(message)}`);
                this.tsStickerManager.CreateStickerByName(String(message));
            });

            room.AddMessageHandler("gameStart", (message) => {
                console.log("[Log] GameStart!");
                this.isStartGame = Boolean(message);
            });

            room.AddMessageHandler("blueTeamSIDsArray", (message) => { 
                console.log(`[Log] blueTeamSIDsArray String(message) : ${String(message)}`); // a,b,c 이런식으로 넘어옴
                this.blueTeam = String(message).split(","); // blue 팀원들의 SID들
            });

            room.AddMessageHandler("redTeamSIDsArray", (message) => {
                console.log(`[Log] redTeamSIDsArray String(message) : ${String(message)}`); // a,b,c 이런식으로 넘어옴
                this.redTeam = String(message).split(","); // red 팀원들의 SID들
            });

        };

        this.effectHasSticker = UnityEngine.Resources.Load("effectHasSticker") as UnityEngine.GameObject;
        this.effectStickerAction = UnityEngine.Resources.Load("effectStickerAction") as UnityEngine.GameObject;

    }

    private Update() {

        // if (UnityEngine.Input.GetKeyDown(UnityEngine.KeyCode.R)) {
        //     UnityEngine.GameObject.Find("SafeArea").transform.GetChild(3).gameObject.SetActive(true);
        // }

        // if (UnityEngine.Input.GetKeyDown(UnityEngine.KeyCode.P)) {
        //     this.tsStickerManager.CreateSticker();
        // }

        // if (this.freezeItemButton.transform.GetChild(1).gameObject.activeSelf && this.room.State.players.get_Item(this.room.SessionId).items.freezeItemCnt > 0)
        //     this.freezeItemButton.transform.GetChild(1).gameObject.SetActive(false);
        // else if (!this.freezeItemButton.transform.GetChild(1).gameObject.activeSelf && this.room.State.players.get_Item(this.room.SessionId).items.freezeItemCnt <= 0)
        //     this.freezeItemButton.transform.GetChild(1).gameObject.SetActive(true);
        // this.freezeItemButton.transform.GetChild(0).GetComponent<Text>().text = String(this.room.State.players.get_Item(this.room.SessionId).items.freezeItemCnt);

        if (this.isStartGame) {
            this.playTime -= UnityEngine.Time.deltaTime;
        }

        if (187.999 >= this.playTime && this.playTime > 187.8) { // BellStart
            this.roundBGM.gameObject.SetActive(false);
            this.AudioManager.audioBellStart();
            //this.panelJoinCntInfo.gameObject.SetActive(false);
            this.textJoinCntInfo.text = `게임 시작! 우리 팀 골대로 슝~~`;

            console.log(`blueTeam : ${this.blueTeam} // redTeam : ${this.redTeam}`); // 각 팀별 플레이어들의 sessionID 들이 담긴 Array
            console.log(`blueTeam.length : ${this.blueTeam.length} // redTeam.length : ${this.redTeam.length}`);
        }

        if (187 >= this.playTime && this.playTime > 185.8) { // 3m 7s ~ 3m 6s : Ready?

            this.StartCoroutine(this.UIManager.CreatReady());
            const myPlayer = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character;
            const myPlayerState = this.room.State.players.get_Item(this.room.SessionId);
            const myName = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.name; //홍치치

            // 각자 자기 팀 골대 안에서 겹치지 않게 리스폰 된다
            // 내가 파랑팀이면
            if (myPlayerState.isBlue) {
                let myBlueIndex = this.blueTeam.indexOf(`${this.room.SessionId}`);
                if (myBlueIndex == 0 ) 
                    myPlayer.Teleport(new UnityEngine.Vector3(60, 0, 11.8), myPlayer.gameObject.transform.rotation);
                if (myBlueIndex == 1 ) 
                    myPlayer.Teleport(new UnityEngine.Vector3(60, 0, 10.58), myPlayer.gameObject.transform.rotation);
                if (myBlueIndex == 2 ) 
                    myPlayer.Teleport(new UnityEngine.Vector3(60, 0, 9.3), myPlayer.gameObject.transform.rotation);
                if (myBlueIndex == 3 ) 
                    myPlayer.Teleport(new UnityEngine.Vector3(60, 0, 8.06), myPlayer.gameObject.transform.rotation);    
            } 
            // 내가 빨강팀이면
            else if (myPlayerState.isBlue != true) {
                let myRedIndex = this.redTeam.indexOf(`${this.room.SessionId}`);
                if (myRedIndex == 0 ) 
                    myPlayer.Teleport(new UnityEngine.Vector3(-6.6, 0, 11.8), myPlayer.gameObject.transform.rotation);
                if (myRedIndex == 1 ) 
                    myPlayer.Teleport(new UnityEngine.Vector3(-6.6, 0, 10.58), myPlayer.gameObject.transform.rotation);
                if (myRedIndex == 2 )
                    myPlayer.Teleport(new UnityEngine.Vector3(-6.6, 0, 9.3), myPlayer.gameObject.transform.rotation);
                if (myRedIndex == 3 )   
                    myPlayer.Teleport(new UnityEngine.Vector3(-6.6, 0, 8.06), myPlayer.gameObject.transform.rotation);
                
            }

            this.SendTransform(ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.transform);

            // 유저가 생성이 되면, 유저의 자식으로 팀 구분 유니폼을 추가로 생성
        {
            // if (myPlayerState.isBlue) {
            //     UnityEngine.GameObject.Instantiate(this.blueTeamUniform, ZepetoPlayers.instance.GetPlayer(this.room.SessionId).character.transform);
            // } else if (myPlayerState.isBlue == false) {
            //     UnityEngine.GameObject.Instantiate(this.redTeamUniform, ZepetoPlayers.instance.GetPlayer(this.room.SessionId).character.transform);
            // }
            // // 팀 구분 유니폼 동기화 제대로 안되서 추가해줌
            // for(let i=0; i < this.blueTeam.length; i++){
            //     UnityEngine.GameObject.Instantiate(this.blueTeamUniform, ZepetoPlayers.instance.GetPlayer(this.blueTeam[i]).character.transform);
            // }
            // for(let i=0; i < this.redTeam.length; i++){
            //     UnityEngine.GameObject.Instantiate(this.redTeamUniform, ZepetoPlayers.instance.GetPlayer(this.redTeam[i]).character.transform);
            // }
        }
            
        }

        // 추가 // 프로필 사진 띄우기
        if (185 >= this.playTime && this.playTime > 181.8) { // 3m 5s : 3

            // 파랑팀 프로필 사진 띄우기
            for(let i=0; i< this.blueTeam.length; i++){
                let myBlueNullIndex = this.blueTeam.indexOf(null || undefined);
                if ( i !== myBlueNullIndex) { 
                    let bluePlayerState = this.room.State.players.get_Item(this.blueTeam[i]);
                    ZepetoWorldHelper.GetProfileTexture(`${bluePlayerState.zepetoUserId}`,(texture:UnityEngine.Texture)=>{
                        UnityEngine.GameObject.Find(`Blue${i}`).GetComponent<Image>().sprite = this.GetSprite(texture);
                    },(error)=>{
                        console.log(error);
                    });
                } 
                else 
                    break;
            }

            // 빨강팀 프로필 사진 띄우기
            for(let i=0; i< this.redTeam.length; i++){
                let myRedNullIndex = this.redTeam.indexOf(null || undefined);
                if (i !== myRedNullIndex){
                    let redPlayerState = this.room.State.players.get_Item(this.redTeam[i]);
                    ZepetoWorldHelper.GetProfileTexture(`${redPlayerState.zepetoUserId}`,(texture:UnityEngine.Texture)=>{
                        UnityEngine.GameObject.Find(`Red${i}`).GetComponent<Image>().sprite = this.GetSprite(texture);
                    },(error)=>{
                        console.log(error);
                    });
                }
                else
                    break;
            }

            this.SendTransform(ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.transform);
        }

        if (185 >= this.playTime && this.playTime > 184.8) { // 3m 5s : 3   //추가 // Team Uniform SetActive
            this.StartCoroutine(this.UIManager.CreatThree());
            this.SendTransform(ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.transform);
            const myPlayer = ZepetoPlayers.instance.GetPlayer(this.room.SessionId).character;
            const myPlayerState = this.room.State.players.get_Item(this.room.SessionId);

            // if (myPlayerState.isBlue) {
            //     myPlayer.transform.GetChild(3).GetChild(0).gameObject.SetActive(true);
            // } else if (myPlayerState.isBlue == false) {
            //     myPlayer.transform.GetChild(3).GetChild(1).gameObject.SetActive(true);
            // }
        }

        if (184 >= this.playTime && this.playTime > 183.8) { // 3m 4s : 2 
            this.StartCoroutine(this.UIManager.CreatTwo());
            this.SendTransform(ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.transform);

        }

        if (183 >= this.playTime && this.playTime > 182.8) { // 3m 3s : 1 
            this.StartCoroutine(this.UIManager.CreatOne());
        }

        if (182 >= this.playTime && this.playTime > 181.8) { // 3m 2s : Start! , Smile Sticker
            let myTeam: string = this.room.State.players.get_Item(this.room.SessionId).isBlue ? "파랑팀" : "빨강팀";
            this.textJoinCntInfo.text = `당신은 ${myTeam} 발판을 얻었습니다`;

            this.roundBGM.gameObject.SetActive(true);
            this.StartCoroutine(this.UIManager.CreatStart());

            console.log('[Log] Smile Sticker Created');
            this.tsStickerManager.CreateSmileSticker();
        }

        if (120 >= this.playTime && this.playTime > 119.8) { // 1m : 3점 스티커들 첫번째 생성
            this.tsStickerManager.CreateStickerFirst();
            console.log('[Log] Great,Angry Sticker Created');
            this.textJoinCntInfo.text = `+3, -3 스티커가 나타났어요!`;
        }

        if (90 >= this.playTime && this.playTime > 89.8) { // 1m 30s : 3점 스티커들 두번째 생성
            this.tsStickerManager.CreateStickerSecond();
            console.log('[Log] Great,Angry Sticker Created');
            this.textJoinCntInfo.text = `+3, -3 스티커가 추가됐어요!`;
        }

        if (60 >= this.playTime && this.playTime > 59.8) { // 2m : 3점 스티커들 마지막 생성
            this.tsStickerManager.CreateStickerThird();
            console.log('[Log] Great,Angry Sticker Created');
            this.textJoinCntInfo.text = `마지막 +3, -3 스티커가 추가됐어요`;
        }





        if (1 >= this.playTime && this.playTime > 0.9) {    // 게임 끝날때쯤 휘슬 소리
            this.AudioManager.audioBellEnd();
        }

        if (this.playTime <= 6 && this.playTime >= 0.1) { // 5초간
            this.textRoundTime.color = UnityEngine.Color.red;
            this.panelJoinCntInfo.gameObject.SetActive(true);
            this.textJoinCntInfo.text = `모두 ${this.Number2SnoString(this.playTime)} 초 후 시상식에서 만나요!`;
        }

        if (0 > this.playTime && this.playTime > -50 && this.playTime != null) {    // 게임 끝날때쯤 휘슬 소리 // AfterGame
            this.panelJoinCntInfo.gameObject.SetActive(false);

            let winTeam: bool = null; 
            const myPlayer = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character;
            const myPlayerState = this.room.State.players.get_Item(this.room.SessionId);
            let myBlueIndex = this.blueTeam.indexOf(`${this.room.SessionId}`); //내가 파랑팀일 경우 파랑팀의 몇번째 index 플레이어인지
            let myRedIndex = this.redTeam.indexOf(`${this.room.SessionId}`); //내가 빨강팀일 경우 빨강팀의 몇번째 index 플레이어인지
            
            // 무승부의 경우
            if (this.room.State.blueScore === this.room.State.redScore) {
                this.reactionWinBlue.gameObject.SetActive(true);
                this.reactionWinRed.gameObject.SetActive(true);
                    // 파랑팀 왼쪽에서 리스폰
                    if (myPlayerState.isBlue) {
                        if (myBlueIndex == 0 ) 
                            myPlayer.Teleport(new UnityEngine.Vector3(566.31, 3, -143.95), UnityEngine.Quaternion.Euler(0,-90,0));
                        if (myBlueIndex == 1 ) 
                            myPlayer.Teleport(new UnityEngine.Vector3(566.31, 3, -145.35), UnityEngine.Quaternion.Euler(0,-90,0));
                        if (myBlueIndex == 2 ) 
                            myPlayer.Teleport(new UnityEngine.Vector3(566.31, 3, -146.87), UnityEngine.Quaternion.Euler(0,-90,0));
                        if (myBlueIndex == 3 ) 
                            myPlayer.Teleport(new UnityEngine.Vector3(566.31, 3, -148.45), UnityEngine.Quaternion.Euler(0,-90,0));
                    } 
                    // 빨강팀 오른쪽에서 리스폰
                    else if (myPlayerState.isBlue != true) {
                        if (myRedIndex == 0 ) 
                            myPlayer.Teleport(new UnityEngine.Vector3(566.31, 3, -158.04), UnityEngine.Quaternion.Euler(0,-90,0));
                        if (myRedIndex == 1 ) 
                            myPlayer.Teleport(new UnityEngine.Vector3(566.31, 3, -159.54), UnityEngine.Quaternion.Euler(0,-90,0));
                        if (myRedIndex == 2 )
                            myPlayer.Teleport(new UnityEngine.Vector3(566.31, 3, -160.95), UnityEngine.Quaternion.Euler(0,-90,0));
                        if (myRedIndex == 3 )   
                            myPlayer.Teleport(new UnityEngine.Vector3(566.31, 3, -162.58), UnityEngine.Quaternion.Euler(0,-90,0))
                    }

                    // if (myPlayerState.isBlue) {
                    //     myPlayer.Teleport(new UnityEngine.Vector3(566.31, 3, -143.95 + (myBlueIndex * -1.5)), UnityEngine.Quaternion.Euler(0, -90, 0));
                    // }
                    // // 빨강팀 오른쪽에서 리스폰
                    // else if (myPlayerState.isBlue != true) {
                    //     myPlayer.Teleport(new UnityEngine.Vector3(566.31, 3, -158.04 + (myBlueIndex * -1.5)), UnityEngine.Quaternion.Euler(0, -90, 0));
                    // }
            }

            // 승패가 갈린 경우
            else {
                winTeam = this.room.State.blueScore > this.room.State.redScore ? true : false; // 파랑팀이 이기면 true, 빨강팀이 이기면 false

                // 내 팀이 이겼다면
                if (myPlayerState.isBlue === winTeam){
                    // 내가 파랑팀이고 파랑팀이 이겼다면
                    if (winTeam === true) {
                        this.awardRed.gameObject.transform.position = new UnityEngine.Vector3(569.6, -7.28, -160); //빨강팀 단상 내려감
                        this.reactionWinBlue.gameObject.SetActive(true);
                        this.reactionLoseRed.gameObject.SetActive(true);
                        if (myBlueIndex == 0 ) 
                            myPlayer.Teleport(new UnityEngine.Vector3(566.31, 3, -143.95), UnityEngine.Quaternion.Euler(0,-90,0));
                        if (myBlueIndex == 1 ) 
                            myPlayer.Teleport(new UnityEngine.Vector3(566.31, 3, -145.35), UnityEngine.Quaternion.Euler(0,-90,0));
                        if (myBlueIndex == 2 ) 
                            myPlayer.Teleport(new UnityEngine.Vector3(566.31, 3, -146.87), UnityEngine.Quaternion.Euler(0,-90,0));
                        if (myBlueIndex == 3 ) 
                            myPlayer.Teleport(new UnityEngine.Vector3(566.31, 3, -148.45), UnityEngine.Quaternion.Euler(0,-90,0));
                    }
                    // 내가 빨강팀이고 빨강팀이 이겼다면
                    if (winTeam === false) {
                        this.awardBlue.gameObject.transform.position = new UnityEngine.Vector3(569.6, -7.302, -145.79); //파랑팀 단상 내려감
                        this.reactionWinRed.gameObject.SetActive(true);
                        this.reactionLoseBlue.gameObject.SetActive(true);
                        if (myRedIndex == 0 ) 
                            myPlayer.Teleport(new UnityEngine.Vector3(566.31, 3, -158.04), UnityEngine.Quaternion.Euler(0,-90,0));
                        if (myRedIndex == 1 ) 
                            myPlayer.Teleport(new UnityEngine.Vector3(566.31, 3, -159.54), UnityEngine.Quaternion.Euler(0,-90,0));
                        if (myRedIndex == 2 ) 
                            myPlayer.Teleport(new UnityEngine.Vector3(566.31, 3, -160.95), UnityEngine.Quaternion.Euler(0,-90,0));
                        if (myRedIndex == 3 ) 
                            myPlayer.Teleport(new UnityEngine.Vector3(566.31, 3, -162.58), UnityEngine.Quaternion.Euler(0,-90,0));
                    }
                }
                // 내 팀이 졌다면
                else if (myPlayerState.isBlue !== winTeam){
                    // 내가 파랑팀이고 파랑팀이 졌다면
                    if (winTeam === false){
                        this.awardBlue.gameObject.transform.position = new UnityEngine.Vector3(569.6, -7.302, -145.79); //파랑팀 단상 내려감
                        this.reactionWinRed.gameObject.SetActive(true);
                        this.reactionLoseBlue.gameObject.SetActive(true);
                        if (myBlueIndex == 0 ) 
                            myPlayer.Teleport(new UnityEngine.Vector3(567.68, -1.07, -144.08), UnityEngine.Quaternion.Euler(0,-90,0));
                        if (myBlueIndex == 1 ) 
                            myPlayer.Teleport(new UnityEngine.Vector3(567.68, -1.07, -145.48), UnityEngine.Quaternion.Euler(0,-90,0));
                        if (myBlueIndex == 2 ) 
                            myPlayer.Teleport(new UnityEngine.Vector3(567.68, -1.07, -147), UnityEngine.Quaternion.Euler(0,-90,0));
                        if (myBlueIndex == 3 ) 
                            myPlayer.Teleport(new UnityEngine.Vector3(567.68, -1.07, -148.58), UnityEngine.Quaternion.Euler(0,-90,0));
                    }
                    // 내가 빨강팀이고 빨강팀이 졌다면
                    if (winTeam === true){
                        this.awardRed.gameObject.transform.position = new UnityEngine.Vector3(569.6, -7.28, -160); //빨강팀 단상 내려감
                        this.reactionWinBlue.gameObject.SetActive(true);
                        this.reactionLoseRed.gameObject.SetActive(true);                        
                        if (myRedIndex == 0 ) 
                            myPlayer.Teleport(new UnityEngine.Vector3(567.68, -1.07, -158.41), UnityEngine.Quaternion.Euler(0,-90,0));
                        if (myRedIndex == 1 ) 
                            myPlayer.Teleport(new UnityEngine.Vector3(567.68, -1.07, -159.91), UnityEngine.Quaternion.Euler(0,-90,0));
                        if (myRedIndex == 2 ) 
                            myPlayer.Teleport(new UnityEngine.Vector3(567.68, -1.07, -161.32), UnityEngine.Quaternion.Euler(0,-90,0));
                        if (myRedIndex == 3 ) 
                            myPlayer.Teleport(new UnityEngine.Vector3(567.68, -1.07, -162.95), UnityEngine.Quaternion.Euler(0,-90,0));
                    }
                }
            }

            myPlayer.transform.rotation = UnityEngine.Quaternion.Euler(0,-90,0);
            this.SendAfterGameSticker(this.room.SessionId); // 이기면 great, 지면 angry, 비기면 smile sticker 띄워줌
            this.SendTransform(ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.transform);

            this.myZepetoPlayers.gameObject.transform.GetChild(2).gameObject.SetActive(false); //이걸 해줘야 afterGameCamera도 켜짐
            this.myZepetoPlayers.gameObject.transform.GetChild(4).GetChild(0).gameObject.SetActive(false); // 이동 UI 끄기
            this.afterGameCamera.gameObject.SetActive(true); // 단상 엔딩 보여줄 카메라 켜줌

        }

        // if (-5 > this.playTime && this.playTime > -5.0 && this.playTime != null) { // AfterGame // 단상에서 못 움직이도록
        //     const myPlayer = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character;
        //     myPlayer.transform.rotation = UnityEngine.Quaternion.Euler(0,-90,0);
        //     this.SendTransform(ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.transform);
        //     let myPlayerCC = myPlayer.characterController;
        //     myPlayerCC.enabled = false; // 단상에서 못 움직이도록
        // }

        if (this.playTime === 188 || this.isStartGame == false) { // 게임 시작 전
            this.textRoundTime.text = "학생 모집 중";
            this.textScoreBlue.text = "파랑팀";
            this.textScoreRed.text = "빨강팀";

        } else if (0 < this.playTime && this.playTime < 188) { // 게임 중
            const myPlayer = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character;
            // myPlayer.characterController.enabled = true; //추가얼음? //게임 시작 해야 움직일 수 있음
            // myPlayer.gameObject.transform.GetComponent<ZepetoCharacter>().enabled = true; //추가 얼음? //게임시작 전까진 못움직임

            this.textScoreBlue.text = String(this.room.State.blueScore);
            this.textScoreRed.text = String(this.room.State.redScore);

            // 3분이 넘게 남아 게임 준비 중에는 3M 0S로 표시 
            this.playTime <= 180 ? this.textRoundTime.text = String(this.Number2MS(this.playTime)) : this.textRoundTime.text = String(this.Number2MS(180));

        } else if (this.playTime < 0 && this.playTime != null) { // 게임 끝 // playTime < 0
            //추가
            const myPlayer = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character;
            myPlayer.gameObject.transform.rotation = UnityEngine.Quaternion.Euler(0,-90,0);

            let isBlueWin: boolean;

            this.textScoreBlue.text = String(this.room.State.blueScore);
            this.textScoreRed.text = String(this.room.State.redScore);
            // console.log(this.playTime);

            if (this.room.State.blueScore > this.room.State.redScore) {
                this.textRoundTime.color = UnityEngine.Color.blue;
                this.textRoundTime.text = "파랑팀 승";
                isBlueWin = true;
            } else if (this.room.State.blueScore < this.room.State.redScore) {
                this.textRoundTime.color = UnityEngine.Color.red;
                this.textRoundTime.text = "빨강팀 승";
                isBlueWin = false;
            } else if (this.room.State.blueScore === this.room.State.redScore) {
                this.textRoundTime.color = UnityEngine.Color.black;
                this.textRoundTime.text = "무승부";
                
                isBlueWin = null;
            }

            // 승리 판정 후 UI 띄우기
            if (isBlueWin === null) {
                this.UIManager.CreatDraw();
            } else if (isBlueWin === this.room.State.players.get_Item(this.room.SessionId).isBlue) {
                this.UIManager.CreatWin();
            } else if (isBlueWin !== this.room.State.players.get_Item(this.room.SessionId).isBlue) {
                this.UIManager.CreatLose();
            }
            this.UIManager.CreatFinish();

        }
    }

    // 일정 Interval Time으로 내(local)캐릭터 transform과 TransState를 server로 전송합니다.
    private * SendMessageLoop(tick: number) {
        while (true) {
            yield new UnityEngine.WaitForSeconds(tick);

            if (this.room != null && this.room.IsConnected) {

                const hasPlayer = ZepetoPlayers.instance.HasPlayer(this.room.SessionId);
                if (hasPlayer) {
                    const myPlayer = ZepetoPlayers.instance.GetPlayer(this.room.SessionId);

                    if (-12 > myPlayer.character.gameObject.transform.position.y && myPlayer.character.gameObject.transform.position.y < -10) {
                        this.SendTransform(myPlayer.character.transform);
                        this.SendDumpSticker(this.room.State.players.get_Item(this.room.SessionId).typeOfSticker);
                        this.SendTypeOfSticker(this.room.SessionId, "");
                        
                        // 대기 중일 땐 떨어져도 원점에서 리스폰
                        if (this.room.State.roomState === 0)
                            myPlayer.character.Teleport(new UnityEngine.Vector3(0, 0, 0), myPlayer.character.gameObject.transform.rotation);
                        
                        
                        // 게임 중일 때는 책상 아래로 떨어지면 자기 팀 골대 앞에서 리스폰 
                        if(this.room.State.players.get_Item(this.room.SessionId).isBlue === true){
                            myPlayer.character.Teleport(new UnityEngine.Vector3(56.98, -1.52, 9.7), myPlayer.character.gameObject.transform.rotation);
                        }else if(this.room.State.players.get_Item(this.room.SessionId).isBlue === false){
                            myPlayer.character.Teleport(new UnityEngine.Vector3(-2.89, 0, 9.66), myPlayer.character.gameObject.transform.rotation);
                        }
                        
                        UnityEngine.GameObject.Instantiate(this.effectStickerAction, myPlayer.character.transform);
                    
                    }
                    if (myPlayer.character.CurrentState != CharacterState.Idle)
                        this.SendTransform(myPlayer.character.transform);
                }
            }
        }
    }

    private OnStateChange(state: State, isFirst: boolean) {
        // 첫 OnStateChange 이벤트 수신 시, State 전체 스냅샷을 수신합니다.
        if (isFirst) {
            {
                // [RoomState] 현재 Room에 존재하는 player 인스턴스 생성
                state.players.ForEach((sessionId: string, player: Player) => this.OnJoinPlayer(sessionId, player));

                // [RoomState] 이후 Room에 입장하는 player 인스턴스 생성
                state.players.OnAdd += (player: Player, sessionId: string) => this.OnJoinPlayer(sessionId, player);

                // [RoomState] 이후 Room에서 퇴장하는 player 인스턴스 제거
                state.players.OnRemove += (player: Player, sessionId: string) => this.OnRemovePlayer(sessionId, player);
            }

            // [CharacterController] 내 (Local)player 인스턴스 생성이 완료된 후, 초기화
            ZepetoPlayers.instance.OnAddedLocalPlayer.AddListener(() => {
                const myPlayer = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer;

                myPlayer.character.gameObject.AddComponent<tsCharacterCollision>();
                myPlayer.character.gameObject.AddComponent<tsStickerAction>();

                myPlayer.character.OnChangedState.AddListener((cur, next) => {
                    this.SendState(next);
                });

                const myPlayerState: Player = this.room.State.players.get_Item(this.room.SessionId);
                //myPlayer.character.characterController.enabled = false; //추가 얼음? //게임시작 전까진 못움직임
                // myPlayer.character.gameObject.transform.GetComponent<ZepetoCharacter>().enabled = false; //추가 얼음? //게임시작 전까진 못움직임
                console.log(`내 캐릭터 이름 : ${myPlayer.name}`); //홍치치 

                myPlayerState.OnChange += (changedValues) => {

                    //this.HasFreezeItem();
                    // if (this.freezeItemButton.transform.GetChild(1).gameObject.activeSelf && this.room.State.players.get_Item(this.room.SessionId).items.freezeItemCnt > 0)
                    //     this.freezeItemButton.transform.GetChild(1).gameObject.SetActive(false);
                    // else if (!this.freezeItemButton.transform.GetChild(1).gameObject.activeSelf && this.room.State.players.get_Item(this.room.SessionId).items.freezeItemCnt <= 0)
                    //     this.freezeItemButton.transform.GetChild(1).gameObject.SetActive(true);
                    // this.freezeItemButton.transform.GetChild(0).GetComponent<Text>().text = String(this.room.State.players.get_Item(this.room.SessionId).items.freezeItemCnt);
                    

                    // 얼음 효과와 남은 시간 표시
                    if (myPlayerState.freezeTime > 0) {
                        myPlayer.character.enabled = false;
                        // this.textInvisibleTime.text = this.Number2S(myPlayerState.freezeTime);
                    } else {
                        myPlayer.character.enabled = true;
                        //this.textInvisibleTime.text = "";
                    }

                };
                this.StartCoroutine(this.SendMessageLoop(0.1));
                this.freezeItemButton.transform.position =  UnityEngine.GameObject.Find("Jump").transform.position;
            });

            // [CharacterController] 다른 player 인스턴스 생성이 완료된 후, 초기화
            ZepetoPlayers.instance.OnAddedPlayer.AddListener((sessionId: string) => {
                const playerState: Player = this.room.State.players.get_Item(sessionId);

                // 유저의 이름 뒤에 sessionId 를 붙여서 후에 이름으로 감지할 수 있도록
                ZepetoPlayers.instance.GetPlayer(sessionId).character.name = `${ZepetoPlayers.instance.GetPlayer(sessionId).character.name}_${playerState.sessionId}`;

                // 유저가 생성이 되면, 유저의 자식으로 스티커 표식을 추가로 생성
                UnityEngine.GameObject.Instantiate(this.stickers, ZepetoPlayers.instance.GetPlayer(sessionId).character.transform);

                // 유저가 생성이 되면, 유저의 자식으로 스티커 표식이펙트을 추가로 생성
                UnityEngine.GameObject.Instantiate(this.effectHasSticker, ZepetoPlayers.instance.GetPlayer(sessionId).character.transform);

                // 유저가 생성이 되면, 유저의 자식으로 팀 구분 유니폼을 추가로 생성 //추가 // Team Uniform SetActive
                UnityEngine.GameObject.Instantiate(this.teamUniforms, ZepetoPlayers.instance.GetPlayer(sessionId).character.transform);
                ZepetoPlayers.instance.GetPlayer(sessionId).character.transform.GetChild(3).gameObject.transform.position.y +=  0.009862438; // 올려주기
                UnityEngine.GameObject.Find("CharacterShadow(Clone)").gameObject.SetActive(false); //원래 그림자 삭제

                console.log(`SID: ${sessionId} MARKKK 1: ${ZepetoPlayers.instance.GetPlayer(sessionId).character.transform.GetChild(3).gameObject.name}`);
                console.log(`SID: ${sessionId} MARKKK 2: ${ZepetoPlayers.instance.GetPlayer(sessionId).character.transform.GetChild(3).transform.position.y}`);

                // if (playerState.isBlue) {
                //     UnityEngine.GameObject.Instantiate(this.blueTeamUniform, ZepetoPlayers.instance.GetPlayer(sessionId).character.transform);
                // } else if (playerState.isBlue == false) {
                //     UnityEngine.GameObject.Instantiate(this.redTeamUniform, ZepetoPlayers.instance.GetPlayer(sessionId).character.transform);
                // }


                // [RoomState] player 인스턴스의 state가 갱신될 때마다 호출됩니다.
                playerState.OnChange += (changedValues) => {
                    const zepetoPlayer = ZepetoPlayers.instance.GetPlayer(sessionId);
                    this.HasSticker(playerState.typeOfSticker, zepetoPlayer);

                    console.log(`[Log] SID: ${sessionId} 스티커 타입 : ${playerState.typeOfSticker} 팀 : ${this.room.State.players.get_Item(sessionId).isBlue}`);

                    if(playerState.typeOfSticker !== ""){
                        zepetoPlayer.character.transform.GetChild(2).gameObject.SetActive(true);
                    } else if(playerState.typeOfSticker === ""){
                        zepetoPlayer.character.transform.GetChild(2).gameObject.SetActive(false);
                    }

                    if (playerState.isBlue) {
                        zepetoPlayer.character.transform.GetChild(3).GetChild(0).gameObject.SetActive(true);
                    } else if (playerState.isBlue == false) {
                        zepetoPlayer.character.transform.GetChild(3).GetChild(1).gameObject.SetActive(true);
                    }

                    // 로컬이 아닌 유저에게만 해당되는 코드
                    if (zepetoPlayer.isLocalPlayer === false) {
                        const position = this.ParseVector3(playerState.transform.position);
                        
                    // 바닥으로 떨어지게 되면 스폰지역(0, 0, 0)에서 리스폰(모든 유저) //골대 안 말고 골대 앞에서 리스폰 되어야 점수 오류 안생김
                    if (-12 < playerState.transform.position.y && playerState.transform.position.y < -10) {
                        // console.log("y < -10");
                        // zepetoPlayer.character.Teleport(new UnityEngine.Vector3(0, 0, 0), zepetoPlayer.character.gameObject.transform.rotation);
                        
                        if(this.room.State.players.get_Item(this.room.SessionId).isBlue === true){
                            zepetoPlayer.character.Teleport(new UnityEngine.Vector3(56.98, -1.52, 9.7), zepetoPlayer.character.gameObject.transform.rotation);
                        }else if(this.room.State.players.get_Item(this.room.SessionId).isBlue === false){
                            zepetoPlayer.character.Teleport(new UnityEngine.Vector3(-2.89, 0, 9.66), zepetoPlayer.character.gameObject.transform.rotation);
                        }
                        
                        UnityEngine.GameObject.Instantiate(this.effectStickerAction, zepetoPlayer.character.transform);
                        
                    }

                        // 서버의 포지션과 인게임에서의 포지션에서 너무 차이가 크다고 판단되면 인게임의 포지션으로 걸어서 이동이 아니라 서버의 포지션으로 순간이동시킴
                        if (UnityEngine.Vector3.Distance(zepetoPlayer.character.transform.position, position) > 3)
                            zepetoPlayer.character.Teleport(position, zepetoPlayer.character.transform.rotation);
                        else {
                            zepetoPlayer.character.MoveToPosition(position);

                            if (playerState.state === CharacterState.JumpIdle || playerState.state === CharacterState.JumpMove) {
                                zepetoPlayer.character.Jump();
                            }
                        }
                    }
                };
            });
        }
    }

    private spawnInterval : number = -8;
    private joinCnt : number = 0;
    private OnJoinPlayer(sessionId: string, player: Player) {
        console.log(`[OnJoinPlayer] players - sessionId : ${sessionId}`);

        const spawnInfo = new SpawnInfo();
        const position = this.ParseVector3(player.transform.position);
        const rotation = this.ParseVector3(player.transform.rotation);
        let spawnPos= new UnityEngine.Vector3(0,2,this.spawnInterval);

        //spawnInfo.position = position;
        spawnInfo.position = spawnPos;
        spawnInfo.rotation = UnityEngine.Quaternion.Euler(rotation);

        const isLocal = this.room.SessionId === player.sessionId;

        ZepetoPlayers.instance.CreatePlayerWithUserId(sessionId, player.zepetoUserId, spawnInfo, isLocal);
        this.spawnInterval += 4;
        this.joinCnt ++;
        this.textJoinCntInfo.text = `8명이 모이면 게임이 시작되요! (${this.joinCnt}/8)`;
        console.log(`[OnJoinPlayer] spawnInfo.position: ${spawnInfo.position}, spawnInterval: ${this.spawnInterval}, spawnInfo.position.z: ${spawnInfo.position.z}`);
    }

    private OnRemovePlayer(sessionId: string, player: Player) {
        console.log(`[OnRemove] players - sessionId : ${sessionId}`);
        ZepetoPlayers.instance.RemovePlayer(sessionId);
        this.joinCnt --;
        if(this.room.State.roomState === 0)
            this.textJoinCntInfo.text = `8명이 모이면 게임이 시작되요! (${this.joinCnt}/8)`;
    }

    private SendTransform(transform: UnityEngine.Transform) {
        const data = new RoomData();

        const pos = new RoomData();
        pos.Add("x", transform.localPosition.x);
        pos.Add("y", transform.localPosition.y);
        pos.Add("z", transform.localPosition.z);
        data.Add("position", pos.GetObject());

        const rot = new RoomData();
        rot.Add("x", transform.localEulerAngles.x);
        rot.Add("y", transform.localEulerAngles.y);
        rot.Add("z", transform.localEulerAngles.z);
        data.Add("rotation", rot.GetObject());
        this.room.Send("onChangedTransform", data.GetObject());
    }

    private SendState(state: CharacterState) {
        const data = new RoomData();
        data.Add("state", state);
        this.room.Send("onChangedState", data.GetObject());
    }

    public ParseVector3(vector3: Vector3): UnityEngine.Vector3 {
        return new UnityEngine.Vector3
            (
                vector3.x,
                vector3.y,
                vector3.z
            );
    }

    public SendTypeOfSticker(sessionId: string, typeOfSticker: string) {
        const data = new RoomData();
        data.Add("sessionId", sessionId);
        data.Add("typeOfSticker", typeOfSticker);
        this.room.Send("onChangedTypeOfSticker", data.GetObject());
    }

    public HasSticker(typeOfSticker: string, zepetoPlayer: ZepetoPlayer) {
        if (typeOfSticker.includes("AngrySticker")) {
            zepetoPlayer.character.transform.GetChild(1).GetChild(0).gameObject.SetActive(true);
            zepetoPlayer.character.transform.GetChild(1).GetChild(1).gameObject.SetActive(false);
            zepetoPlayer.character.transform.GetChild(1).GetChild(2).gameObject.SetActive(false);

        } else if (typeOfSticker.includes("GreatSticker")) {
            zepetoPlayer.character.transform.GetChild(1).GetChild(0).gameObject.SetActive(false);
            zepetoPlayer.character.transform.GetChild(1).GetChild(1).gameObject.SetActive(true);
            zepetoPlayer.character.transform.GetChild(1).GetChild(2).gameObject.SetActive(false);

        } else if (typeOfSticker.includes("SmileSticker")) {
            zepetoPlayer.character.transform.GetChild(1).GetChild(0).gameObject.SetActive(false);
            zepetoPlayer.character.transform.GetChild(1).GetChild(1).gameObject.SetActive(false);
            zepetoPlayer.character.transform.GetChild(1).GetChild(2).gameObject.SetActive(true);

        } else if (typeOfSticker === "") {
            zepetoPlayer.character.transform.GetChild(1).GetChild(0).gameObject.SetActive(false);
            zepetoPlayer.character.transform.GetChild(1).GetChild(1).gameObject.SetActive(false);
            zepetoPlayer.character.transform.GetChild(1).GetChild(2).gameObject.SetActive(false);
            
        }
    }

    public SendUpdateScore(isBlueScore: boolean, point: number) {
        this.room.Send(isBlueScore ? "UpdateBlueScore" : "UpdateRedScore", point);
    }

    public SendDumpSticker(typeOfSticker: string) {
        this.room.Send("dumpSticker", typeOfSticker);
        console.log("[Log] SendDumpSticker " + typeOfSticker);
    }

    public SendDeleteSticker(StickerName: string) {
        this.room.Send("deleteSticker", StickerName);
    }

    public SendFreezePlayer(sessionID: string) {
        this.room.Send("Freeze", sessionID);
    }

    public SendBlockTime(sessionID: string) {
        this.room.Send("Block", sessionID);
    }

    public SendAfterGameSticker(sessionID: string){
        this.room.Send("AfterGameSticker", sessionID);
    }

    public SendUsingItem(item: number) {    // 0번 얼음공격, 이후 순서대로 추가될 아이템들
        this.room.Send("UsingItem", item);
    }

    private Number2MS(time: number) {
        return Math.floor(time / 60) + "M " + Math.floor(time % 60) + "S";
    }

    private Number2S(time: number) {
        return "[" + (Math.floor(time % 60) + 1) + "S]";
    }

    private Number2SnoString(time: number) {
        return (Math.floor(time % 60));
    }

    GetSprite(texture: UnityEngine.Texture){
        let rect:UnityEngine.Rect = new UnityEngine.Rect(0, 0, texture.width, texture.height);
        return UnityEngine.Sprite.Create(texture as UnityEngine.Texture2D, rect, new UnityEngine.Vector2(0.5, 0.5));
    }

    // private HasFreezeItem(){
    //     if (this.freezeItemButton.transform.GetChild(1).gameObject.activeSelf && this.room.State.players.get_Item(this.room.SessionId).items.freezeItemCnt > 0)
    //         this.freezeItemButton.transform.GetChild(1).gameObject.SetActive(false);
    //     else if (!this.freezeItemButton.transform.GetChild(1).gameObject.activeSelf && this.room.State.players.get_Item(this.room.SessionId).items.freezeItemCnt <= 0)
    //         this.freezeItemButton.transform.GetChild(1).gameObject.SetActive(true);
    //     this.freezeItemButton.transform.GetChild(0).GetComponent<Text>().text = String(this.room.State.players.get_Item(this.room.SessionId).items.freezeItemCnt);
    // }
}