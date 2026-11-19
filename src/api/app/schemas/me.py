from app.schemas.common import AddressRead, AddressWrite, TextField


class MeWrite(AddressWrite):
    sender_name: TextField.OptionalShort = None


class MeRead(AddressRead):
    email: str | None
    sender_name: str | None
    # The sender's name and address are printed on every envelope.
    sender_complete: bool
