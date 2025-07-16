import { forwardRef, useLayoutEffect, useRef } from 'react';
import StartGame from './game/main';

export const PhaserGame = forwardRef(function PhaserGame(props, ref)
{
    const game = useRef(null);

    useLayoutEffect(() =>
    {
        if (game.current === null)
        {
            game.current = StartGame("game-container");

            if (typeof ref === 'function')
            {
                ref({ game: game.current, scene: null });
            } else if (ref)
            {
                ref.current = { game: game.current, scene: null };
            }
        }

        return () =>
        {
            if (game.current)
            {
                game.current.destroy(true);
                game.current = null;
            }
        }
    }, [ref]);

    return (
        <div id="game-container"></div>
    );

});