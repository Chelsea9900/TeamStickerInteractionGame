import { AudioClip, AudioSource } from 'UnityEngine'
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'

export default class tsAudioManager extends ZepetoScriptBehaviour {

    private audioSource: AudioSource;

    // 에디터에서 지정해주면 됨
    public audioClipGetSticker: AudioClip;
    public audioClipTeleport: AudioClip;
    public audioClipPushSticker: AudioClip;
    public audioClipBellStart: AudioClip;
    public audioClipBellEnd: AudioClip;
    public audioClipWaiting: AudioClip;


    Start() {
        this.audioSource = this.gameObject.AddComponent<AudioSource>();
    }

    public audioWaiting(){
        this.audioSource.clip = this.audioClipWaiting;
        this.audioSource.loop = true;
        this.audioSource.Play();
    }

    public audioGetSticker() {
        this.audioSource.clip = this.audioClipGetSticker;
        this.audioSource.loop = false;
        this.audioSource.Play();
    }

    public audioTeleport() {
        this.audioSource.clip = this.audioClipTeleport;
        this.audioSource.loop = false;
        this.audioSource.Play();
    }

    public audioPushSticker() {
        this.audioSource.clip = this.audioClipPushSticker;
        this.audioSource.loop = false;
        this.audioSource.Play();
    }

    public audioBellStart() {
        this.audioSource.clip = this.audioClipBellStart;
        this.audioSource.loop = false;
        this.audioSource.Play();
    }

    public audioBellEnd() {
        this.audioSource.clip = this.audioClipBellEnd;
        this.audioSource.loop = false;
        this.audioSource.Play();
    }

}