import { ZepetoScriptBehaviour } from 'ZEPETO.Script'

export default class tsStickerManager extends ZepetoScriptBehaviour {

    //테스트용. P 누르면 다 뜸
    public CreateSticker() {
        for (let i = 0; i < this.transform.childCount; i++) {
            this.transform.GetChild(i).gameObject.SetActive(true);
        }
    }

    public CreateSmileSticker() {
        for (let i = 0; i < this.transform.childCount; i++) {
            if (this.transform.GetChild(i).gameObject.name.includes("SmileSticker"))
                this.transform.GetChild(i).gameObject.SetActive(true);
        }
    }

    public CreateStickerFirst() { // 1분에 Great, Angry 1개씩 생성
        for (let i = 0; i < this.transform.childCount; i++) {
            if (this.transform.GetChild(i).gameObject.name.includes("GreatSticker") || this.transform.GetChild(i).gameObject.name.includes("AngrySticker"))
                if (this.transform.GetChild(i).gameObject.name.includes("(1)") || this.transform.GetChild(i).gameObject.name.includes("(1004)"))
                    this.transform.GetChild(i).gameObject.SetActive(true);
        }
    }
    public CreateStickerSecond() { // 1분30초에 Great, Angry 1개씩 추가 생성
        for (let i = 0; i < this.transform.childCount; i++) {
            if (this.transform.GetChild(i).gameObject.name.includes("GreatSticker") || this.transform.GetChild(i).gameObject.name.includes("AngrySticker"))
                if (this.transform.GetChild(i).gameObject.name.includes("(2)") || this.transform.GetChild(i).gameObject.name.includes("(1005)"))
                    this.transform.GetChild(i).gameObject.SetActive(true);
        }
    }
    public CreateStickerThird() { // 2분에 Great, Angry 1개씩 추가 생성
        for (let i = 0; i < this.transform.childCount; i++) {
            if (this.transform.GetChild(i).gameObject.name.includes("GreatSticker") || this.transform.GetChild(i).gameObject.name.includes("AngrySticker"))
                if (this.transform.GetChild(i).gameObject.name.includes("(3)") || this.transform.GetChild(i).gameObject.name.includes("(1006)"))
                this.transform.GetChild(i).gameObject.SetActive(true);
        }
    }

    public CreateStickerByName(StickerName: string) {
        this.transform.Find(StickerName).gameObject.SetActive(true);
    }

    public DeleteStickerByName(stickerName: string) {
        this.transform.Find(stickerName).gameObject.SetActive(false);
    }
}