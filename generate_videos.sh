#!/bin/bash

# Fox News:

pushd ../video_generator
cat mocks/fox-news.json | cargo run --release --bin video_generator_cli -- --output-path landscape
popd
mv ../video_generator/landscape.mp4 fox-news/


pushd ../video_generator
cat mocks/fox-news.json | cargo run --release --bin video_generator_cli -- --output-path portrait --frame-width 720 --frame-height 1280
popd
mv ../video_generator/portrait.mp4 fox-news/


pushd ../video_generator
cat mocks/fox-news.json | cargo run --release --bin video_generator_cli -- --output-path square --frame-width 720 --frame-height 720
popd
mv ../video_generator/square.mp4 fox-news/


# JP Morgan:

pushd ../video_generator
cat mocks/jp-morgan.json | cargo run --release --bin video_generator_cli -- --output-path landscape
popd
mv ../video_generator/landscape.mp4 jp-morgan/


pushd ../video_generator
cat mocks/jp-morgan.json | cargo run --release --bin video_generator_cli -- --output-path portrait --frame-width 720 --frame-height 1280
popd
mv ../video_generator/portrait.mp4 jp-morgan/


pushd ../video_generator
cat mocks/jp-morgan.json | cargo run --release --bin video_generator_cli -- --output-path square --frame-width 720 --frame-height 720
popd
mv ../video_generator/square.mp4 jp-morgan/


# NY Post:

pushd ../video_generator
cat mocks/ny-post.json | cargo run --release --bin video_generator_cli -- --output-path landscape
popd
mv ../video_generator/landscape.mp4 ny-post/


pushd ../video_generator
cat mocks/ny-post.json | cargo run --release --bin video_generator_cli -- --output-path portrait --frame-width 720 --frame-height 1280
popd
mv ../video_generator/portrait.mp4 ny-post/


pushd ../video_generator
cat mocks/ny-post.json | cargo run --release --bin video_generator_cli -- --output-path square --frame-width 720 --frame-height 720
popd
mv ../video_generator/square.mp4 ny-post/


# Reuters:

pushd ../video_generator
cat mocks/reuters.json | cargo run --release --bin video_generator_cli -- --output-path landscape
popd
mv ../video_generator/landscape.mp4 reuters/


pushd ../video_generator
cat mocks/reuters.json | cargo run --release --bin video_generator_cli -- --output-path portrait --frame-width 720 --frame-height 1280
popd
mv ../video_generator/portrait.mp4 reuters/


pushd ../video_generator
cat mocks/reuters.json | cargo run --release --bin video_generator_cli -- --output-path square --frame-width 720 --frame-height 720
popd
mv ../video_generator/square.mp4 reuters/


# Sky News:

pushd ../video_generator
cat mocks/sky-news.json | cargo run --release --bin video_generator_cli -- --output-path landscape
popd
mv ../video_generator/landscape.mp4 sky-news/


pushd ../video_generator
cat mocks/sky-news.json | cargo run --release --bin video_generator_cli -- --output-path portrait --frame-width 720 --frame-height 1280
popd
mv ../video_generator/portrait.mp4 sky-news/


pushd ../video_generator
cat mocks/sky-news.json | cargo run --release --bin video_generator_cli -- --output-path square --frame-width 720 --frame-height 720
popd
mv ../video_generator/square.mp4 sky-news/


# The Sun:

pushd ../video_generator
cat mocks/the-sun.json | cargo run --release --bin video_generator_cli -- --output-path landscape
popd
mv ../video_generator/landscape.mp4 the-sun/


pushd ../video_generator
cat mocks/the-sun.json | cargo run --release --bin video_generator_cli -- --output-path portrait --frame-width 720 --frame-height 1280
popd
mv ../video_generator/portrait.mp4 the-sun/


pushd ../video_generator
cat mocks/the-sun.json | cargo run --release --bin video_generator_cli -- --output-path square --frame-width 720 --frame-height 720
popd
mv ../video_generator/square.mp4 the-sun/
