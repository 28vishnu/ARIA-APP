"use client";

import VoiceController from "@/controllers/VoiceController";

import Core from "./Core";
import Rings from "./Rings";
import EnergyField from "./EnergyField";
import Pulse from "./Pulse";

export default function Reactor() {
  return (
    <group
      onPointerDown={() => VoiceController.beginHold()}
      onPointerUp={() => VoiceController.endHold()}
      onPointerLeave={() => VoiceController.endHold()}
      onPointerCancel={() => VoiceController.endHold()}
    >
      <EnergyField />
      <Pulse />
      <Core />
      <Rings />
    </group>
  );
}
