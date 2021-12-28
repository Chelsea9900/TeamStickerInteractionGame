declare module "ZEPETO.Multiplay.Schema" {

	import { Schema, MapSchema, ArraySchema } from "@colyseus/schema"; 


	interface State extends Schema {
		players: MapSchema<Player>;
		roomState: number;
		playTime: number;
		redScore: number;
		blueScore: number;
		blueTeam: ArraySchema<Player>;
		redTeam: ArraySchema<Player>;
	}
	class Position extends Schema {
		x: number;
		y: number;
		z: number;
	}
	class Rotation extends Schema {
		w: number;
		x: number;
		y: number;
		z: number;
	}
	class CharacterState extends Schema {
		TryJump: boolean;
		CurrentState: number;
		CurrentStateStatus: number;
	}
	class PlayState extends Schema {
		isTagger: boolean;
		isAlive: boolean;
	}
	class UserInfo extends Schema {
		UserId: string;
		position: Position;
		rotation: Rotation;
		characterState: CharacterState;
		playState: PlayState;
	}
	class Vector3 extends Schema {
		x: number;
		y: number;
		z: number;
	}
	class Transform extends Schema {
		position: Vector3;
		rotation: Vector3;
	}
	class Items extends Schema {
		freezeItemCnt: number;
	}
	class Player extends Schema {
		sessionId: string;
		zepetoHash: string;
		zepetoUserId: string;
		transform: Transform;
		state: number;
		isBlue: boolean;
		typeOfSticker: string;
		freezeTime: number;
		blockTime: number;
		items: Items;
	}
}