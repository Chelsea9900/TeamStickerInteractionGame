import { Sandbox, SandboxOptions, SandboxPlayer } from "ZEPETO.Multiplay";
import { DataStorage } from "ZEPETO.Multiplay.DataStorage";
import { Player, Transform, Vector3 } from "ZEPETO.Multiplay.Schema";
export default class extends Sandbox {
    // 추가여
    private blueTeamArray: string[] =[]; // client에게 broadcast할 blue팀원들 SID 들 
    private redTeamArray: string[] =[]; // client에게 broadcast할 blue팀원들 SID 들 
    
    constructor() {
        super();
    }
    onCreate(options: SandboxOptions) {
        // Room 객체가 생성될 때 호출됩니다.
        // Room 객체의 상태나 데이터 초기화를 처리 한다.
        this.state.roomState = 0;
        // this.state.playTime = 0;
        this.state.redScore = 0;
        this.state.blueScore = 0;
        
        this.onMessage("onChangedTransform", (client, message) => {
            const player = this.state.players.get(client.sessionId);
            const transform = new Transform();
            transform.position = new Vector3();
            transform.position.x = message.position.x;
            transform.position.y = message.position.y;
            transform.position.z = message.position.z;
            transform.rotation = new Vector3();
            transform.rotation.x = message.rotation.x;
            transform.rotation.y = message.rotation.y;
            transform.rotation.z = message.rotation.z;
            player.transform = transform;
        });
        this.onMessage("onChangedState", (client, message) => {
            const player = this.state.players.get(client.sessionId);
            player.state = message.state;
        });
        this.onMessage("onChangedTypeOfSticker", (client, message) => {
            const player = this.state.players.get(message.sessionId);
            player.typeOfSticker = message.typeOfSticker;
        });
        this.onMessage("UpdateBlueScore", (client, message) => {
            this.state.blueScore += parseInt(message);
            console.log(`[Server Log] UpdateBlueScore  ${this.state.blueScore} `);
        });
        this.onMessage("UpdateRedScore", (client, message) => {
            this.state.redScore += parseInt(message);
            console.log(`[Server Log] UpdateRedScore  ${this.state.redScore} `);
        });
        this.onMessage("dumpSticker", (client, message) => {
            this.broadcast("dumpSticker", message);
            console.log(`[Server Log] dumpSticker  ${message} `);
        });
        this.onMessage("deleteSticker", (client, message) => {
            this.broadcast("deleteSticker", message);
            console.log(`[Server Log] Delete - ${message}`);
        });
        this.onMessage("Freeze", (client, message) => {
            const player = this.state.players.get(String(message));
            player.freezeTime = 3000;
            console.log(`[Server Log] Freeze`);
        });
        this.onMessage("Block", (client, message) => {
            const player = this.state.players.get(String(message));
            player.blockTime = 5000;
            console.log(`[Server Log] Block`);
        });
        this.onMessage("AfterGameSticker", (client, message) => {
            const player = this.state.players.get(String(message));
            if (this.state.blueScore === this.state.redScore) {
                player.typeOfSticker = "SmileSticker";
            } else if (this.state.blueScore > this.state.redScore) {
                if (player.isBlue ==  true)
                    player.typeOfSticker = "GreatSticker";
                if (player.isBlue == false)
                    player.typeOfSticker = "AngrySticker";
            } 
            else if (this.state.blueScore < this.state.redScore) {
                if (player.isBlue ==  true)
                    player.typeOfSticker = "AngrySticker";
                if (player.isBlue == false)
                    player.typeOfSticker = "GreatSticker";
            } 
            console.log(`[Server Log] AfterGameSticker`);
        });
        
        this.onMessage("UsingItem", (client, message) => { // 0 freezeItemCnt
            const player = this.state.players.get(client.sessionId);
            switch (parseInt(message)) {
                case 0: player.items.freezeItemCnt--; break;
            }
        });
    }
    async onJoin(client: SandboxPlayer) {
        // schemas.json 에서 정의한 player 객체를 생성 후 초기값 설정.
        console.log(`[OnJoin] sessionId : ${client.sessionId}, HashCode : ${client.hashCode}, userId : ${client.userId}`)
        // 입장 Player Storage Load
        const storage: DataStorage = client.loadDataStorage();
        const player = new Player();
        player.sessionId = client.sessionId;
        if (client.hashCode) {
            player.zepetoHash = client.hashCode;
        }
        if (client.userId) {
            player.zepetoUserId = client.userId;
        }
        // storage에 입장 유저의 transform이 존재하는 지 확인한 다음, 갱신합니다.
        // const raw_val = await storage.get("transform") as string;
        // const json_val = raw_val != null ? JSON.parse(raw_val) : JSON.parse("{}");
        // const transform = new Transform();
        // transform.position = new Vector3();
        // transform.rotation = new Vector3();
        // if (json_val.position) {
        //     transform.position.x = json_val.position.x;
        //     transform.position.y = json_val.position.y;
        //     transform.position.z = json_val.position.z;
        // }
        // if (json_val.rotation) {
        //     transform.rotation.x = json_val.rotation.x;
        //     transform.rotation.y = json_val.rotation.y;
        //     transform.rotation.z = json_val.rotation.z;
        // }
        let visit_cnt = await storage.get("VisitCount") as number;
        if (visit_cnt == null) visit_cnt = 0;
        let freezeItemCnt = await storage.get("freezeItemCnt") as number;
        if (freezeItemCnt == null) {
            freezeItemCnt = 0;
            await storage.set("freezeItemCnt", 0);
        }
        console.log(`[OnJoin] ${client.sessionId}'s visiting count : ${visit_cnt}`)
        // [DataStorage] Player의 방문 횟수를 갱신한다음 Storage Save
        await storage.set("VisitCount", ++visit_cnt);
        // player.transform = transform;
        player.freezeTime = 0;
        player.blockTime = 0;
        player.isBlue = null;
        player.typeOfSticker = "";
        player.items.freezeItemCnt = freezeItemCnt;
        // client 객체의 고유 키값인 sessionId 를 사용해서 유져 객체를 관리.
        // set 으로 추가된 player 객체에 대한 정보를 클라이언트에서는 players 객체에 add_OnAdd 이벤트를 추가하여 확인 할 수 있음.
        this.state.players.set(client.sessionId, player);
    }
    onTick(deltaTime: number): void {
        //  서버에서 설정된 타임마다 반복적으로 호출되며 deltaTime 을 이용하여 일정한 interval 이벤트를 관리할 수 있음.
        this.state.players.forEach((value, key) => {
            if (value.freezeTime > 0)
                value.freezeTime -= deltaTime;
            if (value.blockTime > 0)
                value.blockTime -= deltaTime;
        });
        // (0) 각 팀 책상에 위치시키고 8명 다차면 (1) 벽 세우고, 3 2 1 
        // roomState 0 대기중, 1 게임중, (2 게임 종료 - 보류)
        // this.broadcast("playTime", this.state.playTime);
        if (this.state.players.size == 8 && this.state.roomState == 0) {
            this.state.roomState = 1;
            this.doStartSetting();
        }
    }
    async onLeave(client: SandboxPlayer, consented?: boolean) {
        // 퇴장 Player Storage Load
        const storage: DataStorage = client.loadDataStorage();
        await storage.set("freezeItemCnt", this.state.players.get(client.sessionId).items.freezeItemCnt);
        this.state.players.delete(client.sessionId);
    }
    onPurchased(client: SandboxPlayer, message: any) {
        
        console.log(`${message.itemId}`);
        if (message.itemId == "item.freeze") {
            this.state.players.get(client.sessionId).items.freezeItemCnt++;
        }
    }
    doStartSetting() {
        let randomBoolean: Array<boolean> = new Array<boolean>(8); //8이 아니라 4로 되어있었음..
        let redTeamCnt = 0; // 
        let blueTeamCnt = 0; //
        //추가여
        let b : number = 0;
        let r : number = 0;
        let i = 0;
        this.state.redScore = 0;
        this.state.blueScore = 0;
        console.log(`[Log] Game Start`);
        console.log(`Players Number : ${this.state.players.size}`);
        this.state.players.forEach((value, key) => {
            // //
            // 팀짜기(team == true ? Blue : Red;)
            randomBoolean[i] = Math.random() < 0.5;
            if (randomBoolean[i] == true) {
                redTeamCnt++;
            }
            else {
                blueTeamCnt++;
            }
            if (redTeamCnt === 4) {
                randomBoolean[i] = false;
                redTeamCnt -= 1;
            } else if (blueTeamCnt === 4) {
                randomBoolean[i] = true;
                blueTeamCnt -= 1;
            }
            value.isBlue = randomBoolean[i];
            //추가여 (8인용)
            if (value.isBlue === true){
                this.state.blueTeam.push(value);
                this.blueTeamArray.push(this.state.blueTeam[b].sessionId);
                b++;
            } else if (value.isBlue === false){
                this.state.redTeam.push(value);
                this.redTeamArray.push(this.state.redTeam[r].sessionId);
                r++;
            }
            //
            // if (i === 0){
            //     value.isBlue = true;
            //     this.state.blueTeam.push(value); // blue팀원 정보 //추가여
            // }
            // else if (i !== 0){
            //     value.isBlue = false;
            //     this.state.redTeam.push(value); // red팀원 정보 //추가여
            // }
            i++;
            // console.log(`Player's UserId : ${value.zepetoUserId}, Team : ${value.isBlue == true ? "BlueTeam" : "RedTeam"}`); 
            
        });
        this.broadcast("gameStart", true);
        
        // //추가여 (2인테스트용)
        // this.blueTeamArray.push(this.state.blueTeam[0].sessionId); // blue팀원의 SID 정보
        // this.redTeamArray.push(this.state.redTeam[0].sessionId); // red팀원의 SID 정보 
        this.broadcast("blueTeamSIDsArray",this.blueTeamArray); // blue팀원의 SID들을 클라이언트에게 넘김 
        this.broadcast("redTeamSIDsArray",this.redTeamArray); // red팀원의 SID들을 클라이언트에게 넘김 
        console.log(`[server log] this.blueTeamArray: ${this.blueTeamArray} // this.redTeamArray: ${this.redTeamArray} `); // a,b,c 이런 식으로 넘어감 
        
    }
}