import webpack from 'webpack';
import Events from 'node:events';
import { dirname, join } from 'path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default class Builder {
	get_errors(error, stats){
		const errors = [];
		
		if(error){
			errors.push(error);
		}
		
		if(typeof stats == 'object' && stats !== undefined && stats !== null){
			for(let error of stats.compilation.errors){
				errors.push(error);
			}
		}

		return errors;
	}
	constructor(output){
		this.webpack = webpack({
			mode: 'development',
			devtool: 'source-map',
			entry: {
				client: join(__dirname, 'Client', 'Entry.mjs'),
				worker: join(__dirname, 'Worker', 'Entry.mjs'),
				bootstrapper: join(__dirname, 'Bootstrapper', 'Entry.mjs'),
			},
			context: __dirname,
			output: {
				path: output,
				filename: '[name].js',
			},
		});
	}
	build(){
		return new Promise((resolve, reject) => {
			this.webpack.run((error, stats) => {
				const errors = this.get_errors(error, stats);
	
				if(errors.length){
					reject(errors);
				}else{
					resolve();
				}
			});
		});
	}
	watch(){
		const emitter = new Events();
		
		const watch = new Promise(resolve => setTimeout(() => {
			resolve(this.webpack.watch({}, (error, stats) => {
				const errors = this.get_errors(error, stats);
	
				if(errors.length){
					emitter.emit('error', errors);
				}else{
					emitter.emit('bulit');
				}
			}));
		}));

		emitter.stop = async () => {
			(await watch).close();
		};

		return emitter;
	}
};