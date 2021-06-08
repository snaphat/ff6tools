var c_apultra_pack, c_apultra_unpack;

function Uint8ArrayAlloc(size) {
    const ptr = Module._malloc(size);
    return new Uint8Array(Module.HEAPU8.buffer, ptr, size);
}

function Uint8ArrayFree(ptr) {
    Module._free(ptr.byteOffset);
}

function apultra_pack(data, win_size) {
    var c_input = Uint8ArrayAlloc(data.length);
    c_input.set(data);
    var c_output = Uint8ArrayAlloc(0x10000);
    var size = c_apultra_pack(c_input.byteOffset, c_input.length, c_output.byteOffset, win_size);
    var output = Uint8ArrayAlloc(size + 2);
    output.set(Module.HEAPU8.subarray(c_output.byteOffset, c_output.byteOffset + size), 2);
    output[0] = 0xFF;
    output[1] = 0xFF;
    Uint8ArrayFree(c_input);
    Uint8ArrayFree(c_output);
    return [output, data.length];
}

function apultra_unpack(data) {
    var c_input = Uint8ArrayAlloc(data.length - 2);
    c_input.set(data.slice(2, data.length));
    var c_output = Uint8ArrayAlloc(0x10000);
    var size = c_apultra_unpack(c_input.byteOffset, c_input.length, c_output.byteOffset);
    var output = Uint8ArrayAlloc(size);
    output.set(Module.HEAPU8.subarray(c_output.byteOffset, c_output.byteOffset + size));
    Uint8ArrayFree(c_input);
    Uint8ArrayFree(c_output);
    return [output, data.length];
}

Module.onRuntimeInitialized = async _ => {
    c_apultra_pack = Module.cwrap('pack', 'number', ['number', 'number', 'number', 'number']);
    c_apultra_unpack = Module.cwrap('unpack', 'number', ['number', 'number', 'number']);
};
