import { existsSync, createWriteStream } from 'fs';
import { rm, mkdir } from 'fs/promises';
import { resolve } from 'path';
import archiver from 'archiver';
import pkg from '../package.json' assert { type: 'json' };
class Zip {
    static async run(output, src, name) {
        // if we cannot locate the existing build src, not much we can do at this stage, most
        // likely a bug has been introduced.
        if (!existsSync(src)) {
            throw new Error(`Could not locate '${src}'.`);
        }
        await mkdir(output);
        const stream = createWriteStream(resolve(output, name));
        const archive = archiver('zip');
        stream.on('close', () => console.log(`${name}: ${archive.pointer()} bytes`));
        archive.on('error', err => {
            throw err;
        });
        archive.pipe(stream);
        archive.directory(src, false);
        await archive.finalize();
    }
}
try {
    const output = 'build';
    const src = '.output';
    const now = Date.now();
    const fileName = `${pkg.name}-${pkg.version}--${now % 10000}.zip`;
    // remove the existing output
    await rm(output, { recursive: true, force: true });
    // zip the build src into the output
    await Zip.run(output, src, fileName);
    // remove the existing build src
    await rm(src, { recursive: true, force: true });
}
catch (exception) {
    console.error(exception);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiemlwLm1qcyIsInNvdXJjZVJvb3QiOiJFOi9EZXZlbG9wbWVudC9tZWx2b3ItbW9kcy9zaWRlYmFyLyIsInNvdXJjZXMiOlsidG9vbHMvemlwLm10cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLGlCQUFpQixFQUFFLE1BQU0sSUFBSSxDQUFDO0FBQ25ELE9BQU8sRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLE1BQU0sYUFBYSxDQUFDO0FBQ3hDLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDL0IsT0FBTyxRQUFRLE1BQU0sVUFBVSxDQUFDO0FBQ2hDLE9BQU8sR0FBRyxNQUFNLGlCQUFpQixDQUFDLFNBQVMsSUFBSSxFQUFFLE1BQU0sRUFBRSxDQUFDO0FBRTFELE1BQWUsR0FBRztJQUNQLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLE1BQWMsRUFBRSxHQUFXLEVBQUUsSUFBWTtRQUM3RCxxRkFBcUY7UUFDckYsb0NBQW9DO1FBQ3BDLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztZQUNuQixNQUFNLElBQUksS0FBSyxDQUFDLHFCQUFxQixHQUFHLElBQUksQ0FBQyxDQUFDO1FBQ2xELENBQUM7UUFFRCxNQUFNLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUVwQixNQUFNLE1BQU0sR0FBRyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDeEQsTUFBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRWhDLE1BQU0sQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLEtBQUssT0FBTyxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBQzdFLE9BQU8sQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxFQUFFO1lBQ3RCLE1BQU0sR0FBRyxDQUFDO1FBQ2QsQ0FBQyxDQUFDLENBQUM7UUFFSCxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3JCLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRTlCLE1BQU0sT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQzdCLENBQUM7Q0FDSjtBQUVELElBQUksQ0FBQztJQUNELE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQztJQUN2QixNQUFNLEdBQUcsR0FBRyxTQUFTLENBQUM7SUFDdEIsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQ3ZCLE1BQU0sUUFBUSxHQUFHLEdBQUcsR0FBRyxDQUFDLElBQUksSUFBSSxHQUFHLENBQUMsT0FBTyxLQUFLLEdBQUcsR0FBRyxLQUFLLE1BQU0sQ0FBQztJQUVsRSw2QkFBNkI7SUFDN0IsTUFBTSxFQUFFLENBQUMsTUFBTSxFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztJQUVuRCxvQ0FBb0M7SUFDcEMsTUFBTSxHQUFHLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFFckMsZ0NBQWdDO0lBQ2hDLE1BQU0sRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7QUFDcEQsQ0FBQztBQUFDLE9BQU8sU0FBUyxFQUFFLENBQUM7SUFDakIsT0FBTyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUM3QixDQUFDIn0=