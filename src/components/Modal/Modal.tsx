import useClickOutside from "@/utils/hooks/useClickOutside";
import React, { ReactNode } from "react";
import {
  CloseButton,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalWrapper,
} from "./Modal.styled";
import Button from "../Button/Button";
import { PriorityLevel } from "@/utils/types/enums";
import Image from "next/image";
import CloseIconBlack from "@/assets/icons/close-icon-black.svg";

type ModalProps = {
  children: ReactNode;
  onConfirm?: () => void;
  setShowModal: (show: boolean) => void;
  showModal: boolean;
  title?: string;
  width?: string;
};

const Modal = ({
  children,
  onConfirm,
  setShowModal,
  showModal,
  title,
  width,
}: ModalProps) => {
  const { ref } = useClickOutside(showModal, setShowModal);

  return (
    <>
      {showModal && (
        <ModalWrapper>
          <ModalBody ref={ref} width={width}>
            <ModalHeader>
              <div></div>
              {title && <ModalTitle>{title}</ModalTitle>}
              <CloseButton onClick={() => setShowModal(false)}>
                <Image src={CloseIconBlack} alt="close-icon-black" />
              </CloseButton>
            </ModalHeader>
            {children}
            {onConfirm && (
              <ModalFooter>
                <Button
                  label="Cancel"
                  onClick={() => setShowModal(false)}
                  padding="0.5rem"
                  priority={PriorityLevel.PRIMARY}
                />
                <Button
                  label="Confirm"
                  onClick={() => {
                    onConfirm();
                    setShowModal(false);
                  }}
                  padding="0.5rem"
                  priority={PriorityLevel.SECONDARY}
                />
              </ModalFooter>
            )}
          </ModalBody>
        </ModalWrapper>
      )}
    </>
  );
};

export default Modal;
